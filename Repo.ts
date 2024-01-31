import { Accessible } from "./Accessible";
import Model from "./Model";
import ORMConfig from "./ORMConfig";
import Observer from "./Observer";
import TableInfo from "./TableInfo";
import EntityMapper from "./query/EntityMapper";
import Query from "./query/Query";
import { SQL, SQLValue } from "./connection/SQL";
import { v4 as uuid } from 'uuid'

export default class Repo<T extends Model> {

    private info: TableInfo
    private observers: Observer<T>[] = []
    private accessible: Accessible|null = null

    constructor(model: any, private connection: SQL, config: ORMConfig) {
        this.info = new TableInfo(model, config)
    }

    public query(): Query<T> {
        return new Query(this, this.getModel())
    }

    public async save(entity: T): Promise<void> {
        this.observers.filter(o => o.saving).forEach(o => o.saving(entity))
        if((entity as any).__entityExists) {
            await this.update(entity)
        } else {
            await this.create(entity)
        }
        this.observers.filter(o => o.saved).forEach(o => o.saved(entity))
    }

    public async create(entity: T): Promise<void> {
        const now = new Date()
        for(let k of this.info.getKeyProperties()) {
            if(!entity[k] && this.info.getPropertyType(k).name == 'uuid') {
                entity[k] = uuid()
            }
        }
        if(this.info.getCreatedProperty()) {
            entity[this.info.getCreatedProperty()] = now
        }
        if(this.info.getUpdatedProperty()) {
            entity[this.info.getUpdatedProperty()] = now
        }
        this.observers.filter(o => o.creating).forEach(o => o.creating(entity))
        const values = EntityMapper.map(this.info, entity, true)
        const qs = this.connection.renderer().renderInsert(this.info, values)
        const insertId = await this.connection.write(qs.query, ...qs.parameters);
        if(insertId) {
            entity[this.info.getKeyProperties()[0]] = insertId
        }
        ;(entity as any).__entityExists = true
        ;(entity as any).__updateOriginalValues()
        this.observers.filter(o => o.created).forEach(o => o.created(entity))
    }

    public async update(entity: T): Promise<void> {
        this.observers.filter(o => o.updating).forEach(o => o.updating(entity))

        if(this.info.getUpdatedProperty()) {
            entity[this.info.getUpdatedProperty()] = new Date()
        }
        const values = EntityMapper.map(this.info, entity)
        let q = this.query()
        for(let k of this.info.getKeyProperties()) {
            q = q.whereEq(k, entity[k])
        }
        await q.update(values)

        ;(entity as any).__updateOriginalValues()
        this.observers.filter(o => o.updated).forEach(o => o.updated(entity))
    }

    public async delete(entity: T): Promise<void> {
        if(!this.info.isSoftDelete()) {
            await this.finalDelete(entity)
            return
        }
        let q = this.query()
        for(let k of this.info.getKeyProperties()) {
            q = q.whereEq(k, entity[k])
        }
        this.observers.filter(o => o.deleting).forEach(o => o.deleting(entity))
        const now = new Date()
        const values: Record<string, SQLValue> = {
            [this.info.getColumnName(this.info.getSoftDeleteProperty())]: now
        }
        if(this.info.getUpdatedProperty()) {
            entity[this.info.getUpdatedProperty()] = now
            values[this.info.getColumnName(this.info.getUpdatedProperty())] = now
        }
        entity[this.info.getSoftDeleteProperty()] = now
        await q.update(values)
        ;(entity as any).__updateOriginalValues()
        this.observers.filter(o => o.deleted).forEach(o => o.deleted(entity))
    }

    public async restore(entity: T): Promise<void> {
        if(!this.info.isSoftDelete) {
            return
        }
        entity[this.info.getSoftDeleteProperty()] = null
        await this.update(entity)
    }

    public async finalDelete(entity: T): Promise<void> {
        this.observers.filter(o => o.deleting).forEach(o => o.deleting(entity))
        let q = this.query()
        for(let k of this.info.getKeyProperties()) {
            q = q.whereEq(k, entity[k])
        }
        if(this.info.getUpdatedProperty()) {
            entity[this.info.getUpdatedProperty()] = new Date()
        }
        await q.delete()
        ;(entity as any).__updateOriginalValues()
        this.observers.filter(o => o.deleted).forEach(o => o.deleted(entity))
    }

    public observe(observer: Observer<T>): this {
        this.observers.push(observer)
        return this
    }

    public getModel(): any {
        return this.info.getModel()
    }

    public getAccessible(): Accessible|null {
        return this.accessible
    }

    public getConnection(): SQL {
        return this.connection
    }

    public getInfo(): TableInfo {
        return this.info
    }

    public close(): Promise<void> {
        return this.connection.close()
    }

}