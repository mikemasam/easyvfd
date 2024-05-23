import get_client_token from "#app/auth/token";
import { ZAckEFDMSType } from "#app/receiping/types";
import TraNet from "#lib/tra-transport";
import Client from "#models/Client";
import VfdDatedCounter from "#models/VfdDatedCounter";
import VfdReceipt from "#models/VfdReceipt";
import VfdReceiptPayment from "#models/VfdReceiptPayment";
import VfdReceiptVatTotal from "#models/VfdReceiptVatTotal";
import { AppState, IJob } from "moonsight";
import Decimal from "decimal.js";
import { DateTime } from "luxon";

const totals = async (dailycounter: VfdDatedCounter, client_id: number) => {
  const item: any = await VfdReceipt.query()
    .where({ client_id: client_id, dc_id: dailycounter.id })
    //@ts-ignore
    .sum({ amount: "amount_tax_incl" })
    .first();
  const total_sum: any = await VfdReceipt.query()
    .where({ client_id: client_id })
    .where("dc_id", "<=", dailycounter.id)
    //@ts-ignore
    .sum({ amount: "amount_tax_incl" })
    .first();
  return {
    DAILYTOTALAMOUNT: item.amount,
    GROSS: total_sum.amount,
    CORRECTIONS: 0,
    DISCOUNTS: 0,
    SURCHARGES: 0,
    TICKETSVOID: 0,
    TICKETSVOIDTOTAL: 0,
    TICKETSFISCAL: dailycounter.dc,
    TICKETSNONFISCAL: 0,
  };
};

const vattotals = async (dailycounter: VfdDatedCounter, client: Client) => {
  const items: any = [];

  const codes = client.taxcodelist();
  for (let j = 0; j < codes.length; j++) {
    const taxcode = codes[j];
    const vat:{ net_amount: number; tax_amount: number; tax_code: string } | undefined = await VfdReceiptVatTotal.query()
      .whereIn(
        "vfd_receipt_id",
        VfdReceipt.query().select("id").where({ dc_id: dailycounter.id }),
      )
      .where("tax_code_char", taxcode.code)
      .groupBy("tax_code_char")
      .select("tax_code_char")
      //@ts-ignore
      .sum({ net_amount: "amount_net", tax_amount: "amount_tax" })
      .first() as any;
    if (vat) {
      items.push({
        VATRATE: `${taxcode.code}-${taxcode!.rate}`,
        NETTAMOUNT: vat.net_amount,
        TAXAMOUNT: vat.tax_amount,
      });
    } else {
      items.push({
        VATRATE: `${taxcode.code}-${taxcode!.rate}`,
        NETTAMOUNT: 0,
        TAXAMOUNT: 0,
      });
    }
  }
  return items;
};

const payments = async (dailycounter: VfdDatedCounter) => {
  const types = ["CASH", "CHEQUE", "CCARD", "EMONEY", "INVOICE"];
  const items: any[] = [];
  for (let j = 0; j < types.length; j++) {
    const type = types[j];
    const pays = await VfdReceiptPayment.query()
      .whereIn(
        "vfd_receipt_id",
        VfdReceipt.query().select("id").where({ dc_id: dailycounter.id }),
      )
      .where("pmttype", type)
      .execute();
    let amount = new Decimal(0);
    for (let i = 0; i < pays.length; i++) {
      const item = pays[i];
      amount = amount.plus(item.amount);
    }
    items.push({
      PMTTYPE: type,
      PMTAMOUNT: amount.toNumber(),
    });
  }
  return items;
};
export const job = IJob(
  async (state: AppState, args): Promise<[number, string]> => {
    console.log("job started");
    const dailycounter = await VfdDatedCounter.query()
      .where("zreport_processed_on", "<", DateTime.now().toMillis())
      .where((q) => {
        q.where({ zreport_status: VfdDatedCounter.STATUS_FAILED }).orWhere(
          (builder) => {
            builder.where("dc_date", "<", DateTime.now().toFormat("yyyyMMdd"));
            builder.where({ zreport_status: VfdDatedCounter.STATUS_OPEN });
          },
        );
      })
      .orderBy("id", "asc")
      .first();
    if (!dailycounter) return [IJob.EMPTY, "No new zreport"];

    await VfdDatedCounter.query()
    .where("id", dailycounter.id)
    .patch({
      zreport_processed_on: DateTime.now().plus({ minutes: 4 }).toMillis()
    });

    const client = await Client.query().findById(dailycounter.client_id);
    if (!client) return [IJob.FAILED, "client not found"];
    const [token, err] = await get_client_token(client.id);
    if (!token) return [IJob._ERRORED, "Authentication failed."];

    const zdate = DateTime.fromFormat(dailycounter.dc_date, "yyyyMMdd").endOf("day")
    const zreport = {
      ZREPORT: {
        DATE: zdate.toFormat("yyyy-MM-dd"),
        TIME: zdate.toFormat("HH:mm:ss"),
        HEADER: [
          {
            LINE: client.name,
          },
          {
            LINE: client.street,
          },
          {
            LINE: client.mobile,
          },
          {
            LINE: client.address,
          },
        ],
        VRN: client.vrn,
        TIN: client.tin,
        TAXOFFICE: client.tax_office,
        REGID: client.reg_id,
        ZNUMBER: dailycounter.dc_date,
        EFDSERIAL: client.vendor_serial_number,
        REGISTRATIONDATE: DateTime.fromMillis(client.registered_on).toFormat("yyyy-MM-dd"),
        USER: client.uin,
        SIMIMSI: "WEBAPI",
        TOTALS: await totals(dailycounter, client.id),
        VATTOTALS: await vattotals(dailycounter, client),
        PAYMENTS: await payments(dailycounter),
        CHANGES: {
          VATCHANGENUM: 0,
          HEADCHANGENUM: 0,
        },
        ERRORS: "",
        FWVERSION: "3.0",
        FWCHECKSUM: "WEBAPI",
      },
    };
    const [result] = await TraNet.make(process.env.POST_ZREPORT_URL!)
      .contentSignedXml(zreport, client.privatekey64)
      .routingKey("vfdzreport")
      .auth(token)
      .certSerial(client.certificate_serial_number)
      .postEfdms<ZAckEFDMSType>();
    if (!result?.EFDMS) return [IJob.FAILED, "Request Failed"];
    console.log(JSON.stringify(result, null, 2));
    if (result.EFDMS.ZACK.ACKCODE == 0) {
      await receiptProcessed(dailycounter.id);
      return [IJob.OK, "ok"];
    } else {
      await receiptFailed(dailycounter.id);
      return [
        IJob.FAILED,
        `Failed with message: ${result.EFDMS.ZACK.ACKMSG}`,
      ];
    }
    console.log(JSON.stringify(zreport, null, 2));
    return [IJob.OK, ""];
  },
  { seconds: 5 },
);


const receiptProcessed = async (receipt_id: number) => {
  const changes = {
    zreport_processed_on: DateTime.now().toMillis(),
    zreport_status: VfdDatedCounter.STATUS_PROCESSED,
  };
  await VfdDatedCounter.query().patch(changes).where({ id: receipt_id });
};
const receiptFailed = async (receipt_id: number) => {
  const changes = {
    zreport_processed_on: DateTime.now().toMillis(),
    zreport_status: VfdDatedCounter.STATUS_FAILED,
  };
  await VfdDatedCounter.query().patch(changes).where({ id: receipt_id });
};
