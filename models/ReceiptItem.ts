import IModel from "./IModel";

export default class ReceiptItem extends IModel {
  id!: number;
  item_ref!: string;
  desc!: string;
  qty!: number;
  amount_excl!: number;
  amount_incl!: number;
  amount_tax!: number;
  vat_rate!: number;
  tax_code_pos!: number;
  receipt_id!: number;

  static get tableName() {
    return "receipt_items";
  }
}
