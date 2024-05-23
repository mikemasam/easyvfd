import IModel from "./IModel";

export default class VfdDatedCounter extends IModel {
  id!: number;
  dc!: number;
  dc_date!: string;
  zreport_status!: number;
  zreport_processed_on!: number;
  client_id!: number;
  static get tableName() {
    return "vfd_dated_counters";
  }
  static STATUS_PROCESSED = 1;
  static STATUS_OPEN = 0;
  static STATUS_FAILED = -1;
}
