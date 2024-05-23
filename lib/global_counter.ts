import Client from "#models/Client";

export default class GlobalCounter {
  dirty = false;
  current = 0;
  added = 0;
  client_id: number | null = null;
  receipt_code: string | null = null;
  constructor(client_id: number, current_gc: number, receipt_code: string) {
    this.client_id = client_id;
    this.receipt_code = receipt_code;
    this.current = current_gc;
  }
  static async make(client_id: number): Promise<GlobalCounter> {
    const client = await Client.query().findOne({ id: client_id });
    if (!client) throw `Global counter for client id ${client_id} not found`;
    return new GlobalCounter(client_id, client.gc, client.receipt_code);
  }
  add() {
    this.added++;
  }
  next() {
    return this.current + this.added;
  }
  next_receipt() {
    return this.receipt_code + "" + this.next();
  }
  async commit() {
    if (this.dirty) {
      throw "Global counter already disposed";
    }
    this.dirty = true;
    const result = await Client.query()
      .where({ id: this.client_id })
      .increment("gc", this.added);
    return result;
  }
}
