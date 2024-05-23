import Receipt from "#models/Receipt";
import { IncomingReceipt } from "./types";
import Client from "#models/Client";
import ReceiptItem from "#models/ReceiptItem";
import ReceiptPayment from "#models/ReceiptPayment";
import writeVfdReceipt from "./write.vfd.receipt";
import Decimal from "decimal.js";

export default async function write_receipt(
  body: IncomingReceipt,
): Promise<[boolean, string]> {
  const client = await Client.query().findOne({ tin: body.tin });
  if (!client) return [false, "TIN not found"];
  const dup_ref = await Receipt.query().findOne({ bill_reference: body.bill_reference });
  if (dup_ref) return [false, "Duplicate bill reference"];
  const dup_receipt = await Receipt.query().findOne({
    bill_receipt: body.bill_receipt,
  });
  if (dup_receipt) return [false, "Duplicate bill receipt"];
  const receipt = await Receipt.query().insert({
    bill_reference: body.bill_reference,
    bill_receipt: body.bill_receipt,
    client_id: client.id,
    customer_id: body.customer_id,
    customer_name: body.customer_name,
    customer_id_type: body.customer_id_type,
    issued_date: body.issued_date
  });
  if (!receipt) return [false, "Receipt failed"];

  const codes = client.taxcodelist();
  for (let i = 0; i < body.items.length; i++) {
    const item = body.items[i];
    let amount_incl = new Decimal(item.amount_incl || 0);
    if(!amount_incl.isInteger() || amount_incl.lte(0)){
      amount_incl = new Decimal(item.amount_excl)
      amount_incl = amount_incl.plus(item.amount_tax);
    }
    const taxcode = codes.find(e => e.code == item.tax_code)!
    const r = await ReceiptItem.query().insert({
      receipt_id: receipt.id,
      qty: item.qty,
      desc: item.desc,
      item_ref: item.ref,
      vat_rate: taxcode.rate,
      tax_code_pos: taxcode.pos,
      amount_excl: item.amount_excl,
      amount_tax: item.amount_tax,
      amount_incl: amount_incl.toNumber(),
    });
    if (!r) return [false, "Failed"];
  }
  for (let i = 0; i < body.items.length; i++) {
    const item = body.payments[i];
    const r = await ReceiptPayment.query().insert({
      receipt_id: receipt.id,
      amount: item.amount,
      pmt_ref: item.ref,
      pmt_type: item.type,
    });
    if (!r) return [false, "Failed"];
  }

  const [status, message] = await writeVfdReceipt(receipt.id);
  if(!status) return [false, message];
  return [true, "Receipt issued."];
}
