import IModel from "./IModel";

export default class VfdReceiptItem extends IModel {
  id!: number;
  item_id!: number;
  item_ref!: string;
  desc!: string;
  qty!: number;
  amount!: number;
  tax_code_pos!: number;
  vfd_receipt_id!: number;
  client_id!: number;
  static get tableName() {
    return "vfd_receipt_items";
  }
}
