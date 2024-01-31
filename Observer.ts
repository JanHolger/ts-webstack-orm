import Model from "./Model";

export default interface Observer<T extends Model> {
    saving?(entity: T)
    saved?(entity: T)
    creating?(entity: T)
    created?(entity: T)
    updating?(entity: T)
    updated?(entity: T)
    deleting?(entity: T)
    deleted?(entity: T)
}