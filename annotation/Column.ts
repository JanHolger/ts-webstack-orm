export interface ColumnDefinition {
    name?: string,
    key?: boolean,
    enum?: boolean,
    json?: boolean,
    uuid?: boolean,
    float?: boolean,
    size?: string
}

export default function Column(definition: ColumnDefinition = {}) {
    return (targetProto: any, propertyName: string) => {
        if(!targetProto.constructor.__columns__) {
            targetProto.constructor.__columns__ = {}
        }
        targetProto.constructor.__columns__[propertyName] = definition
    }
}