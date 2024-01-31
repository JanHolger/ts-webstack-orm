import 'reflect-metadata'
import ORMConfig from "./ORMConfig";
import StringUtil from './util/StringUtil';
import { ColumnDefinition } from './annotation/Column';

export interface PropertyType {
    name: string
    [k: string]: any
}

export default class TableInfo {
    private tableName: string
    private properties: string[] = []
    private propertyTypes: Record<string, any> = {}
    private columnNames: Record<string, string> = {}
    private softDelete: string|null = null
    private createdProperty: string|null = null
    private updatedProperty: string|null = null
    private key: string[] = []
    constructor(private model: any, private config: ORMConfig) {
        this.tableName = model.__table_name__ ? model.__table_name__ : StringUtil.snakeCase(StringUtil.englishPlural(model.name))
        if(model.__columns__) {
            Object.keys(model.__columns__).forEach(fn => {
                const def: ColumnDefinition = model.__columns__[fn]
                this.properties.push(fn)
                const rawType = Reflect.getMetadata('design:type', model.prototype, fn)
                const type = {
                    name: '',
                    raw: rawType
                }
                if(def.enum) {
                    type.name = 'enum'
                } else if(def.json) {
                    type.name = 'json'
                } else if(def.uuid) {
                    type.name = 'uuid'
                } else if(def.float) {
                    type.name = 'float'
                } else if(rawType == String) {
                    type.name = 'string'
                } else if(rawType == Number) {
                    type.name = 'int'
                } else if(rawType == Date) {
                    type.name = 'date'
                } else if(fn == 'uuid') {
                    type.name = 'uuid'
                } else if(fn == 'id') {
                    type.name = 'int'
                } else {
                    throw new Error(`Property '${fn}' of model '${model.name}' has unsupported type`)
                }
                this.propertyTypes[fn] = type
                this.columnNames[fn] = def.name || StringUtil.snakeCase(fn)
                if(def.key) {
                    this.key.push(fn)
                }
            })
        }
        if(this.key.length == 0) {
            if(this.properties.includes('id')) {
                this.key.push('id')
            } else if (this.properties.includes('uuid')) {
                this.key.push('uuid')
            } else {
                throw new Error(`No key properties found`)
            }
        }
        this.softDelete = model.__soft_delete__ || null
        this.createdProperty = model.__created_property__ || null
        this.updatedProperty = model.__updated_property__ || null
    }
    public getKeyProperties(): string[] {
        return this.key
    }
    public getDataProperties(): string[] {
        return this.properties.filter(p => !this.key.includes(p))
    }
    public getProperties(): string[] {
        return this.properties
    }
    public getPropertyType(property: string): PropertyType {
        return this.propertyTypes[property]
    }
    public getColumnName(property: string): string {
        return this.columnNames[property]
    }
    public getTableName(): string {
        return this.tableName
    }
    public isSoftDelete(): boolean {
        return !!this.softDelete
    }
    public getSoftDeleteProperty(): string|null {
        return this.softDelete
    }
    public getCreatedProperty(): string|null {
        return this.createdProperty
    }
    public getUpdatedProperty(): string|null {
        return this.updatedProperty
    }
    public getModel(): any {
        return this.model
    }
}