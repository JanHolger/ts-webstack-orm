export default function Table(name: string) {
    return (targetProto: any) => {
        targetProto.__table_name__ = name
    }
}