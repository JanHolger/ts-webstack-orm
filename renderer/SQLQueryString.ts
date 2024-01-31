import { SQLValue } from "../connection/SQL";

export default interface SQLQueryString {
    query: string,
    parameters: SQLValue[]
}