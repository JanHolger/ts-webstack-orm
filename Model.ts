import { dir } from "console"
import ORM from "./ORM"
import Repo from "./Repo"
import TableInfo from "./TableInfo"
import Query from "./query/Query"

export default abstract class Model {
    private __entityExists = false
    private __originalValues: Record<string, any> = {}
    private __updateOriginalValues() {
        const info = this.__getRepo().getInfo()
        for(let p of info.getProperties()) {
            this.__originalValues[p] = this[p]
        }
    }
    public static query<T extends Model>(): Query<T> {
        return ORM.getRepo(this).query() as Query<T>
    }
    public static where<T extends Model>(left: any, operator: string, right: any): Query<T> {
        return this.query<T>().where(left, operator, right)
    }
    private __getRepo(): Repo<this> {
        return ORM.getRepo(this.constructor)
    }
    public save(): this {
        this.__getRepo().save(this)
        return this
    }
    public delete(): this {
        this.__getRepo().delete(this)
        return this
    }
    public finalDelete(): this {
        this.__getRepo().finalDelete(this)
        return this
    }
    public restore(): this {
        this.__getRepo().restore(this)
        return this
    }
    public getDirtyProperties(): string[] {
        const info = this.__getRepo().getInfo()
        const dirty = []
        for(let p of info.getProperties()) {
            if(this.__originalValues[p] != this[p]) {
                dirty.push(p)
            }
        }
        return dirty
    }
    public isDirty(): boolean {
        return this.getDirtyProperties().length > 0
    }
}