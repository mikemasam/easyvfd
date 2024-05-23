import IModel from "./IModel";

export default class Receipt extends IModel {
  id!: number;
  issued_date!: string;
  bill_reference!: string;
  bill_receipt!: string;
  customer_id!: string;
  customer_id_type!: string;
  customer_name!: string;
  customer_mobile!: string;
  client_id!: number;

  static get tableName() {
    return "receipts";
  }

}
