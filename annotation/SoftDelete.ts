export default function SoftDelete(property: string = 'deletedAt') {
    return (targetProto: any) => {
        targetProto.__soft_delete__ = property
    }
}