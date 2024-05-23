import get_client_token from "#app/auth/token";
import { RctAck, RctAckEFDMSType } from "#app/receiping/types";
import { objectToXml } from "#lib/exchange";
import TraNet from "#lib/tra-transport";
import Client, { TaxCode } from "#models/Client";
import VfdReceipt from "#models/VfdReceipt";
import VfdReceiptItem from "#models/VfdReceiptItem";
import VfdReceiptPayment from "#models/VfdReceiptPayment";
import VfdReceiptVatTotal from "#models/VfdReceiptVatTotal";
import { warn } from "console";
import { AppState, IJob } from "moonsight";
import Decimal from "decimal.js";
import { DateTime } from "luxon";

export const job = IJob(
  async (state: AppState, args): Promise<[number, string]> => {
    console.log("job started");
    const rct = await VfdReceipt.query()
      .where("status", VfdReceipt.STATUS_PENDING)
      .orderBy("id", "desc")
      .first();
    if (!rct) return [IJob.EMPTY, "no new receipts"];
    const client = await Client.query().findById(rct.client_id);
    if (!client) return [IJob._ERRORED, "receipt client not found"];
    const [token, err] = await get_client_token(client.id);
    if (!token) return [IJob._ERRORED, "Authentication failed."];
    const data = {
      RCT: {
        DATE: rct.rdate,
        TIME: rct.rtime,
        TIN: rct.tin,
        REGID: rct.reg_id,
        EFDSERIAL: rct.efd_serial,
        CUSTIDTYPE: rct.cust_id_type,
        CUSTID: rct.cust_id,
        CUSTNAME: rct.cust_name,
        MOBILENUM: rct.mobile_num,
        RCTNUM: rct.rctnum,
        DC: rct.dc,
        GC: rct.gc,
        ZNUM: rct.znum,
        RCTVNUM: rct.rctv_num,
        ITEMS: {
          ITEM: await buildItems(rct.id),
        },
        TOTALS: await buildTotals(rct),
        PAYMENTS: await buildPayments(rct.id),
        VATTOTALS: await buildVatTotals(rct.id, client.taxcodelist()),
      },
    };

    const [result] = await TraNet.make(process.env.POST_RECEIPT_URL!)
      .contentSignedXml(data, client.privatekey64)
      .routingKey(client.routing_key)
      .auth(token)
      .certSerial(client.certificate_serial_number)
      .postEfdms<RctAckEFDMSType>();
    if (!result?.EFDMS) return [IJob.FAILED, "Request Failed"];
    if (result.EFDMS.RCTACK.ACKCODE == 0) {
      await receiptProcessed(rct.id);
      return [IJob.OK, "ok"];
    } else {
      await receiptFailed(rct.id);
      return [
        IJob.FAILED,
        `Failed with message: ${result.EFDMS.RCTACK.ACKMSG}`,
      ];
    }
  },
  { seconds: 2 },
);
const receiptProcessed = async (receipt_id: number) => {
  const changes = {
    processed_on: DateTime.now().toMillis(),
    status: VfdReceipt.STATUS_PROCESSED,
  };
  await VfdReceipt.query().patch(changes).where({ id: receipt_id });
};
const receiptFailed = async (receipt_id: number) => {
  const changes = {
    processed_on: DateTime.now().toMillis(),
    status: VfdReceipt.STATUS_FAILED,
  };
  await VfdReceipt.query().patch(changes).where({ id: receipt_id });
};

const buildItems = async (vfd_receipt_id: number): Promise<any[]> => {
  const ritems = await VfdReceiptItem.query()
    .where("vfd_receipt_id", vfd_receipt_id)
    .execute();
  const items: any[] = [];
  for (let i = 0; i < ritems.length; i++) {
    const item = ritems[i];
    items.push({
      ID: item.item_ref,
      DESC: item.desc,
      QTY: new Decimal(item.qty).round().toNumber(),
      TAXCODE: item.tax_code_pos,
      AMT: item.amount,
    });
  }
  return items;
};

const buildPayments = async (vfd_receipt_id: number): Promise<any[]> => {
  const types = ["CASH", "CHEQUE", "CCARD", "EMONEY", "INVOICE"];
  const items: any[] = [];
  for (let j = 0; j < types.length; j++) {
    const type = types[j];
    const pays = await VfdReceiptPayment.query()
      .where("vfd_receipt_id", vfd_receipt_id)
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

const buildVatTotals = async (
  vfd_receipt_id: number,
  codes: TaxCode[],
): Promise<any[]> => {
  const items: any[] = [];

  for (let j = 0; j < codes.length; j++) {
    const taxcode = codes[j];
    const pays = await VfdReceiptVatTotal.query()
      .where("vfd_receipt_id", vfd_receipt_id)
      .where("tax_code_char", taxcode.code)
      .execute();
    let netamount = new Decimal(0);
    let taxamount = new Decimal(0);
    for (let i = 0; i < pays.length; i++) {
      const item = pays[i];
      netamount = netamount.plus(item.amount_net);
      taxamount = taxamount.plus(item.amount_tax);
    }
    items.push({
      VATRATE: taxcode.code,
      NETTAMOUNT: netamount.toNumber(),
      TAXAMOUNT: taxamount.toNumber(),
    });
  }
  return items;
};

async function buildTotals(receipt: VfdReceipt) {
  return {
    TOTALTAXEXCL: receipt.amount_tax_excl,
    TOTALTAXINCL: receipt.amount_tax_incl,
    DISCOUNT: 0,
  };
}
