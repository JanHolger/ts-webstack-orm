import QueryElement from "./QueryElement";

export enum QueryConjunctionOperator {
    AND = 'AND',
    OR = 'OR',
    XOR = 'XOR'
}

export default class QueryConjunction implements QueryElement {
    constructor(public readonly operator: QueryConjunctionOperator) {}
}