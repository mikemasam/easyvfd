import IModel from "./IModel";

export default class VfdReceiptPayment extends IModel {
  id!: number;
  amount!: number;
  pmttype!: string;
  pmtref!: string;
  vfd_receipt_id!: number;
  client_id!: number;
  static get tableName() {
    return "vfd_receipt_payments";
  }
}
