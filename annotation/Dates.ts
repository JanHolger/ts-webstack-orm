export default function Dates(createdProperty: string = 'createdAt', updatedProperty: string = 'updatedAt') {
    return (targetProto: any) => {
        if(createdProperty) {
            targetProto.__created_property__ = createdProperty
        }
        if(updatedProperty) {
            targetProto.__updated_property__ = updatedProperty
        }
    }
}