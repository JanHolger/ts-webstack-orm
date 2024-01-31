import TableInfo from "../TableInfo";

export default class QueryColumn {
    constructor(public readonly name: string, public readonly raw: boolean = false) {}
    buildString(info: TableInfo): string {
        if(this.raw) {
            return this.name
        }
        let name = this.name
        if(info.getProperties().includes(name)) {
            name = info.getColumnName(name)
        }
        return name.split('.').map(s => '`' + s + '`').join('.')
    }
}