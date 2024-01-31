import { SQLValue } from "./SQL";

export type QueryLogger = (query: string, parameters: SQLValue[]) => void