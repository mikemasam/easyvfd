import IModel from "./IModel";

export default class VfdReceiptVatTotal extends IModel {
  id!: number;
  amount_net!: number;
  amount_tax!: number;
  tax_code_char!: string;
  vfd_receipt_id!: number;
  client_id!: number;
  static get tableName() {
    return "vfd_receipt_vat_totals";
  }
}
