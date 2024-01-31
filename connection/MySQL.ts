import { QueryLogger } from "./QueryLogger";
import { SQL, SQLValue } from "./SQL";
import mysql, { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import QueryStringRenderer from "../renderer/QueryStringRenderer";
import MySQLQueryStringRenderer from "../renderer/MySQLQueryStringRenderer";
import Model from "../Model";

export default class MySQL implements SQL {

    private host: string
    private port: number
    private database: string
    private username: string
    private password: string
    private connection: mysql.Connection
    private loggers: QueryLogger[] = []

    constructor(host: string, port: number, database: string, username: string, password: string) {
        this.host = host
        this.port = port
        this.database = database
        this.username = username
        this.password = password
    }

    async read(query: string, ...parameters: SQLValue[]): Promise<Record<string, SQLValue>[]> {
        this.loggers.forEach(l => l(query, parameters))
        const [results, fields] = await this.execute(query, ...parameters)
        return results as Record<string,SQLValue>[]
    }

    async write(query: string, ...parameters: SQLValue[]): Promise<number|null> {
        this.loggers.forEach(l => l(query, parameters))
        const [result, fields] = await this.execute(query, ...parameters)
        return (result as ResultSetHeader).insertId || null
    }

    private async execute(query: string, ...parameters: SQLValue[]): Promise<[RowDataPacket[]|ResultSetHeader, FieldPacket[]]> {
        const c = await this.getConnection()
        return await c.execute(query, parameters)
    }

    private async getConnection(): Promise<mysql.Connection> {
        if(!this.connection) {
            this.connection = await mysql.createConnection({
                host: this.host,
                port: this.port,
                database: this.database,
                user: this.username,
                password: this.password
            })
        }
        return this.connection
    }

    renderer(): QueryStringRenderer<Model> {
        return new MySQLQueryStringRenderer()
    }

    addQueryLogger(logger: QueryLogger) {
        this.loggers.push(logger)
    }

    removeQueryLogger(logger: QueryLogger) {
        this.loggers = this.loggers.filter(l => l != logger)
    }

    async close() {
        if(this.connection) {
            await this.connection.end()
            this.connection = null
        }
    }

}