import Model from "../Model"
import Query from "./Query";
import QueryGroup from "./QueryGroup";

export default interface QueryLike<T extends Model> {

    where(left: any, operator: string, right: any): this

    whereEq(left: any, right: any): this

    whereLike(left: any, right: any): this

    whereNotLike(left: any, right: any): this

    whereNull(left: any): this

    whereNotNull(left: any): this

    whereIn(left: any, right: any[]): this

    whereNotIn(left: any, right: any[]): this

    whereExists<T extends Model>(model: any, group: (q: Query<T>) => Query<T>): this

    whereNotExists<T extends Model>(model: any, group: (q: Query<T>) => Query<T>): this

    whereGroup(group: (q: QueryGroup<T>) => QueryGroup<T>): this

    orWhere(left: any, operator: string, right: any): this

    orWhereEq(left: any, right: any): this

    orWhereLike(left: any, right: any): this

    orWhereNotLike(left: any, right: any): this

    orWhereNull(left: any): this

    orWhereNotNull(left: any): this

    orWhereIn(left: any, right: any[]): this

    orWhereNotIn(left: any, right: any[]): this

    orWhereExists<T extends Model>(model: any, group: (q: Query<T>) => Query<T>): this

    orWhereNotExists<T extends Model>(model: any, group: (q: Query<T>) => Query<T>): this

    orWhereGroup(group: (q: QueryGroup<T>) => QueryGroup<T>): this
    
}