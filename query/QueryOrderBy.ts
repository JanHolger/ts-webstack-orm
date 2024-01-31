import QueryColumn from "./QueryColumn";

export default class QueryOrderBy {
    constructor(public readonly column: QueryColumn, public readonly desc: boolean) {}
}