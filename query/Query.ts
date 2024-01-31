import Model from "../Model";
import Repo from "../Repo";
import { SQL, SQLValue } from "../connection/SQL";
import EntityMapper from "./EntityMapper";
import QueryColumn from "./QueryColumn";
import QueryGroup from "./QueryGroup";
import QueryLike from "./QueryLike";
import QueryOrderBy from "./QueryOrderBy";

export default class Query<T extends Model> implements QueryLike<T> {

    private _connection: SQL
    private _select: QueryColumn[] = []
    private _where: QueryGroup<T> = new QueryGroup()
    private _offset: number|null = null
    private _limit: number|null = null
    private _order: QueryOrderBy[] = []
    private _withDeleted: boolean = false
    private _groupBy: QueryColumn[] = []
    private _having: QueryGroup<T>|null = null
    private _applyAccessible = false
    private _accessor: any|null = null

    constructor(private repo: Repo<T>, private model: any) {
        this._connection = repo.getConnection()
    }

    public select(...columns: (QueryColumn|string)[]): this {
        this._select = columns.map(c => {
            if(typeof c == 'string') {
                return new QueryColumn(c)
            }
            return c
        })
        return this
    }

    public withDeleted(): this {
        this._withDeleted = true
        return this
    }

    public limit(limit: number): this {
        this._limit = limit
        return this
    }

    public offset(offset: number): this {
        this._offset = offset
        return this
    }

    public orderBy(column: QueryColumn|string, desc: boolean = false): this {
        if(typeof column == 'string') {
            column = new QueryColumn(column)
        }
        this._order.push(new QueryOrderBy(column, desc))
        return this
    }

    public groupBy(column: QueryColumn|string): this {
        if(typeof column == 'string') {
            column = new QueryColumn(column)
        }
        this._groupBy.push(column)
        return this
    }

    public having(group: (q: QueryGroup<T>) => QueryGroup<T>): this {
        if(!this._having) {
            this._having = new QueryGroup()
        }
        this._having = group(this._having)
        return this
    }

    public accessible(accessor: any): this {
        this._applyAccessible = true
        this._accessor = accessor
        return this
    }

    public where(left: any, operator: string, right: any): this {
        this._where.where(left, operator, right)
        return this
    }

    public whereEq(left: any, right: any): this {
        this._where.whereEq(left, right)
        return this
    }

    public whereLike(left: any, right: any): this {
        this._where.whereLike(left, right)
        return this
    }

    public whereNotLike(left: any, right: any): this {
        this._where.whereNotLike(left, right)
        return this
    }

    public whereNull(left: any): this {
        this._where.whereNull(left)
        return this
    }

    public whereNotNull(left: any): this {
        this._where.whereNotNull(left)
        return this
    }

    public whereIn(left: any, right: any[]): this {
        this._where.whereIn(left, right)
        return this
    }

    public whereNotIn(left: any, right: any[]): this {
        this._where.whereNotIn(left, right)
        return this
    }

    public whereExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        this._where.whereExists(model, group)
        return this
    }

    public whereNotExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        this._where.whereNotExists(model, group)
        return this
    }

    public whereGroup(group: (q: QueryGroup<T>) => QueryGroup<T>): this {
        this._where.whereGroup(group)
        return this
    }

    public orWhere(left: any, operator: string, right: any): this {
        this._where.orWhere(left, operator, right)
        return this
    }

    public orWhereEq(left: any, right: any): this {
        this._where.orWhereEq(left, right)
        return this
    }

    public orWhereLike(left: any, right: any): this {
        this._where.orWhereLike(left, right)
        return this
    }

    public orWhereNotLike(left: any, right: any): this {
        this._where.orWhereNotLike(left, right)
        return this
    }

    public orWhereNull(left: any): this {
        this._where.orWhereNull(left)
        return this
    }

    public orWhereNotNull(left: any): this {
        this._where.orWhereNotNull(left)
        return this
    }

    public orWhereIn(left: any, right: any[]): this {
        this._where.orWhereIn(left, right)
        return this
    }

    public orWhereNotIn(left: any, right: any[]): this {
        this._where.orWhereNotIn(left, right)
        return this
    }

    public orWhereExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        this._where.orWhereExists(model, group)
        return this
    }

    public orWhereNotExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        this._where.orWhereNotExists(model, group)
        return this
    }

    public orWhereGroup(group: (q: QueryGroup<T>) => QueryGroup<T>): this {
        this._where.orWhereGroup(group)
        return this
    }

    public async get(): Promise<T[]> {
        const qs = this._connection.renderer().renderQuery(this)
        const res = await this._connection.read(qs.query, ...qs.parameters)
        const entities: T[] = res.map(r => {
            const e: T = new this.model()
            EntityMapper.mapBack(this.repo.getInfo(), e, r)
            ;(e as any).__entityExists = true
            ;(e as any).__updateOriginalValues()
            return e
        })
        return entities
    }

    public async first(): Promise<T> {
        const r = await this.limit(1).get()
        if(r.length == 0) {
            return null
        }
        return r[0]
    }

    public async update(values: Record<string, SQLValue>): Promise<void> {
        if(Object.keys(values).length == 0) {
            return
        }
        const qs = this._connection.renderer().renderUpdate(this, values)
        await this._connection.write(qs.query, ...qs.parameters)
    }

    public async delete(): Promise<void> {
        const qs = this._connection.renderer().renderDelete(this)
        await this._connection.write(qs.query, ...qs.parameters)
    }

    public async isEmpty(): Promise<boolean> {
        return (await this.count()) == 0
    }

    public async isNotEmpty(): Promise<boolean> {
        return (await this.limit(1).count()) > 0
    }

    public async count(): Promise<number> {
        this.select(new QueryColumn('COUNT(*)', true))
        const qs = this._connection.renderer().renderQuery(this)
        const res = await this._connection.read(qs.query, ...qs.parameters)
        return res[0][0] as number
    }

    public getWhereGroup(): QueryGroup<T> {
        return this._where
    }

    public getHavingGroup(): QueryGroup<T>|null {
        return this._having
    }

    public getSelect(): QueryColumn[] {
        return this._select
    }

    public isWithDeleted(): boolean {
        return this._withDeleted
    }

    public getLimit(): number|null {
        return this._limit
    }

    public getOffset(): number|null {
        return this._offset
    }

    public shouldApplyAccessible(): boolean {
        return this._applyAccessible
    }

    public getAccessor(): any|null {
        return this._accessor
    }

    public getGroupBy(): QueryColumn[] {
        return this._groupBy
    }

    public getOrderBy(): QueryOrderBy[] {
        return this._order
    }

    public getModel(): any {
        return this.model
    }

    public getRepo(): Repo<T> {
        return this.repo
    }

}