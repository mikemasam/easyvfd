import DailyCounter from "#lib/daily_counter";
import GlobalCounter from "#lib/global_counter";
import Client from "#models/Client";
import Receipt from "#models/Receipt";
import ReceiptItem from "#models/ReceiptItem";
import ReceiptPayment from "#models/ReceiptPayment";
import VfdReceipt from "#models/VfdReceipt";
import VfdReceiptItem from "#models/VfdReceiptItem";
import VfdReceiptPayment from "#models/VfdReceiptPayment";
import VfdReceiptVatTotal from "#models/VfdReceiptVatTotal";
import Decimal from "decimal.js";
import { DateTime } from "luxon";

export default async function writeVfdReceipt(
  receipt_id: number,
): Promise<[false | VfdReceipt, string]> {
  const receipt = await Receipt.query().findById(receipt_id);
  if (!receipt) return [false, "receipt not found"];
  const client = await Client.query().findById(receipt.client_id);
  if (!client) return [false, "client not found"];
  const items = await ReceiptItem.query().where({
    receipt_id: receipt.id,
  });
  if (!items?.length) return [false, "items not found"];
  const payments = await ReceiptPayment.query().where({
    receipt_id: receipt.id,
  });
  if (!payments?.length) return [false, "payments not found"];

  const issued_date = DateTime.fromFormat(
    receipt.issued_date,
    "yyyy-MM-dd HH:mm:ss",
  );
  const gc = await GlobalCounter.make(receipt.client_id);
  const dc = await DailyCounter.make(receipt.client_id);
  if (!dc) return [false, "daily counter not available"];
  gc.add();
  dc.add();
  const _vfd_receipt = {
    receipt_id: receipt.id,
    dc: dc.next(),
    gc: gc.next(),
    tin: client.tin,
    client_id: client.id,
    dc_id: dc.counter_id,
    rdate: issued_date.toFormat("yyyy-MM-dd"),
    rtime: issued_date.toFormat("HH:mm:ss"),
    rctnum: gc.next(),
    reg_id: client.reg_id,
    cust_id: receipt.customer_id,
    znum: issued_date.toFormat("yyyyMMdd"),
    rctv_num: gc.next_receipt(),
    cust_name: receipt.customer_name,
    efd_serial: client.vendor_serial_number,
    mobile_num: receipt.customer_mobile,
    cust_id_type: receipt.customer_id_type,
    processed_on: 0,
    status: VfdReceipt.STATUS_DRAFT,
    amount_tax_incl: 0,
    amount_tax_excl: 0,
  };
  const vfd_receipt = await VfdReceipt.query().insert(_vfd_receipt);
  await dc.commit();
  await gc.commit();
  let total_incl = new Decimal(0);
  let total_excl = new Decimal(0);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await VfdReceiptItem.query().insert({
      item_ref: item.item_ref,
      client_id: receipt.client_id,
      qty: item.qty,
      desc: item.desc,
      amount: item.amount_incl,
      item_id: item.id,
      tax_code_pos: item.tax_code_pos,
      vfd_receipt_id: vfd_receipt.id,
    });
    total_incl = total_incl.plus(item.amount_incl);
    total_excl = total_excl.plus(item.amount_excl);
  }

  const vats: { net_amount: number; tax_amount: number; tax_code_pos: number }[] =
    (await ReceiptItem.query()
      .where("receipt_id", receipt.id)
      .groupBy("tax_code_pos")
      .select("tax_code_pos")
      //@ts-ignore
      .sum({ net_amount: "amount_excl", tax_amount: "amount_tax" })) as any;
  const codes = client.taxcodelist();
  for (let i = 0; i < vats.length; i++) {
    const vat = vats[i];
    const code = codes.find(e => e.pos == vat.tax_code_pos)!.code;
    await VfdReceiptVatTotal.query().insert({
      amount_net: vat.net_amount,
      amount_tax: vat.tax_amount,
      tax_code_char: code,
      vfd_receipt_id: vfd_receipt.id,
      client_id: vfd_receipt.client_id,
    });
  }

  for (let i = 0; i < payments.length; i++) {
    const item = payments[i];
    await VfdReceiptPayment.query().insert({
      client_id: receipt.client_id,
      amount: item.amount,
      pmttype: item.pmt_type,
      pmtref: item.pmt_ref,
      vfd_receipt_id: vfd_receipt.id,
    });
  }
  await VfdReceipt.query().where("id", vfd_receipt.id).patch({
    amount_tax_excl: total_excl.toNumber(),
    amount_tax_incl: total_incl.toNumber(),
    status: VfdReceipt.STATUS_PENDING,
  });
  return [vfd_receipt, "VFD written successful"];
}
