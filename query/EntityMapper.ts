import { dir } from "console";
import Model from "../Model";
import TableInfo from "../TableInfo";
import { SQLValue } from "../connection/SQL";

export default class EntityMapper {

    public static mapBack<T extends Model>(info: TableInfo, entity: T, values: Record<string, SQLValue>) {
        const keys = info.getProperties()
        for(let k of keys) {
            const type = info.getPropertyType(k)
            let value = values[info.getColumnName(k)]
            if(value !== null && value !== undefined) {
                switch(type.name) {
                    case 'json': {
                        value = JSON.parse(value as string)
                        break
                    }
                }
            }
            entity[k] = value
        }
    }

    public static map<T extends Model>(info: TableInfo, entity: T, includeKeys: boolean = false): Record<string, SQLValue> {
        const record = {}
        const keys = includeKeys ? info.getProperties() : info.getDataProperties()
        const dirty = entity.getDirtyProperties()
        if(info.getUpdatedProperty() && dirty.length == 1 && dirty[0] == info.getUpdatedProperty()) {
            dirty.splice(0, 1)
        }
        for(let k of keys) {
            if(!dirty.includes(k)) {
                continue
            }
            const type = info.getPropertyType(k)
            let value = entity[k]
            switch(type.name) {
                case 'json': {
                    value = JSON.stringify(value)
                    break
                }
            }
            record[info.getColumnName(k)] = value
        }
        return record
    }

}