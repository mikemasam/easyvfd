import { Model, ModelClass, Page, QueryBuilder } from "objection";

export default class IQueryBuilder<
  M extends Model,
  R = M[],
> extends QueryBuilder<M, R> {
  ArrayQueryBuilderType!: IQueryBuilder<M, M[]>;
  SingleQueryBuilderType!: IQueryBuilder<M, M>;
  MaybeSingleQueryBuilderType!: IQueryBuilder<M, M | undefined>;
  NumberQueryBuilderType!: IQueryBuilder<M, number>;
  PageQueryBuilderType!: IQueryBuilder<M, Page<M>>;

  forBusiness(business_id: number | null) {
    const model: ModelClass<Model> = this.modelClass();
    const tb = model.tableName;
    if (!tb) throw "[QB] table not found";
    if (!business_id) throw "[QB] business argument is required.";
    return this.where("business_id", business_id);
  }
  paged(pager: Paged | undefined) {
    if (!pager) return this;
    return this.page(pager.page, pager.per_page);
  }
  sorted({ field, sort }: { field?: string; sort?: string }) {
    const model: ModelClass<M> = this.modelClass();
    const fields: string[] | null = (model as any).sortables?.();
    if (!fields || !field || !fields.includes(field)) field = "id";
    if (sort != "asc" && sort != "desc") sort = "desc";
    return this.orderBy(field, sort as any);
  }
  toJSON() {
    return this.then((rs: R) => {
      return (rs as M[]).map((i: M) => i.toJSON());
    });
  }
}

export type PageQuery = {
  search?: string;
  state?: string;
  expired?: string;
  field?: string;
  sort?: string;
};

export type Paged = {
  page: number;
  per_page: number;
};
