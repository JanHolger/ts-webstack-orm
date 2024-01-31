import Model from "../Model"
import { QueryLogger } from "./QueryLogger"
import QueryStringRenderer from "../renderer/QueryStringRenderer"

export type SQLValue = string | number | boolean | Date

export interface SQL {
    read(query: string, ...parameters: SQLValue[]): Promise<Record<string, SQLValue>[]>
    write(query: string, ...parameters: SQLValue[]): Promise<number|null>
    renderer<T extends Model>(): QueryStringRenderer<T>
    addQueryLogger(logger: QueryLogger)
    removeQueryLogger(logger: QueryLogger)
    close(): Promise<void>
}