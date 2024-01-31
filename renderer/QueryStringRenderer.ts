import Model from "../Model"
import TableInfo from "../TableInfo"
import Query from "../query/Query"
import { SQLValue } from "../connection/SQL"
import SQLQueryString from "./SQLQueryString"

export default interface QueryStringRenderer<T extends Model> {

    renderInsert(info: TableInfo, values: Record<string, SQLValue>): SQLQueryString
    renderQuery(query: Query<T>): SQLQueryString
    renderUpdate(query: Query<T>, values: Record<string, SQLValue>): SQLQueryString
    renderDelete(query: Query<T>): SQLQueryString

}