import { Model, Pojo } from "objection";
import IQueryBuilder from "./ibulder";
import path from "path";
import { DateTime } from "luxon";

export default class IModel extends Model {
  created_at!: string;
  updated_at!: string;
  freeze!: number;
  QueryBuilderType!: IQueryBuilder<this>;
  static QueryBuilder = IQueryBuilder;
  static get modelPaths() {
    return [path.resolve("models")];
  }

  $beforeInsert() {
    const timestamp = new Date();
    this.created_at = timestamp as any;
    this.updated_at = timestamp as any;
    if (this.freezed) {
      this.freeze = DateTime.now().toMillis();
    }
  }

  $beforeUpdate() {
    this.updated_at = new Date() as any;
    if (this.freezed) {
      this.freeze = DateTime.now().toMillis();
    }
  }

  get hidden() {
    return ["created_at", "updated_at"];
  }

  $formatJson(jsonRaw: Pojo) {
    const json = super.$formatJson(jsonRaw);
    const keys = Object.keys(json).filter((u) => !this.hidden.includes(u));
    const result = keys.reduce((acc: any, key: string) => {
      acc[key] = json[key];
      return acc;
    }, {});

    return result;
  }

  static get virtualAttributes(): string[] {
    return [];
  }

  get statusdesc() {
    return "-";
  }
  static sortable(): string[] {
    return [];
  }
  get freezed() {
    return false;
  }
}
