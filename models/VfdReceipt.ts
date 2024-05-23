import IModel from "./IModel";

export default class VfdReceipt extends IModel {
  id!: number;
  client_id!: number;
  status!: number;
  processed_on!: number;
  rdate!: string;
  rtime!: string;
  tin!: string;
  reg_id!: string;
  efd_serial!: string;
  cust_id_type!: string;
  cust_id!: string;
  cust_name!: string;
  mobile_num!: string;
  rctnum!: number;
  dc!: number;
  gc!: number;
  znum!: string;
  rctv_num!: string;
  receipt_id!: number;
  dc_id!: number;
  amount_tax_incl!: number;
  amount_tax_excl!: number;

  static get tableName() {
    return "vfd_receipts";
  }

  static STATUS_FAILED = -1;
  static STATUS_DRAFT = 0;
  static STATUS_PENDING = 1;
  static STATUS_PROCESSED = 2;
}
