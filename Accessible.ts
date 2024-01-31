import Model from "./Model";
import Query from "./query/Query";
import QueryGroup from "./query/QueryGroup";

export type Accessible = (query: Query<Model>, accessChecks: QueryGroup<Model>, accessor: any) => QueryGroup<Model>