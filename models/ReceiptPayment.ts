import IModel from "./IModel";

export default class ReceiptPayment extends IModel {
  id!: number;
  amount!: number;
  pmt_type!: string;
  pmt_ref!: string;
  receipt_id!: number;

  static get tableName() {
    return "receipt_payments";
  }
}
