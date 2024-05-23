import VfdDatedCounter from "#models/VfdDatedCounter";
import { DateTime } from "luxon";

export default class DailyCounter {
  dirty = false;
  current = 0;
  counter_id = 0;
  added = 0;
  constructor(current_dc: number, counter_id: number) {
    this.current = current_dc;
    this.counter_id = counter_id;
  }
  static async make(client_id: number) {
    const dc_date = DateTime.now().toFormat("yyyyMMdd");
    let counter = await VfdDatedCounter.query().findOne({
      client_id: client_id,
      dc_date,
    });
    if (counter && counter.zreport_status != VfdDatedCounter.STATUS_OPEN) {
      return null;
    }
    if (!counter)
      counter = await VfdDatedCounter.query().insert({
        dc: 0,
        client_id: client_id,
        dc_date,
        zreport_status: VfdDatedCounter.STATUS_OPEN,
        zreport_processed_on: 0,
      });
    return new DailyCounter(counter.dc, counter.id);
  }
  add() {
    this.added++;
  }
  next() {
    return this.current + this.added;
  }
  async commit() {
    if (this.dirty) throw "Daily counter already disposed";
    this.dirty = true;
    return VfdDatedCounter.query()
      .where({ id: this.counter_id })
      .increment("dc", this.added);
  }
}
