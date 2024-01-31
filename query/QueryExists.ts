import Model from "../Model";
import Query from "./Query";
import QueryElement from "./QueryElement";

export default class QueryExists<T extends Model> implements QueryElement {
    constructor(public readonly query: Query<T>, public readonly not: boolean) {}
}