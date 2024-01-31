import QueryElement from "./QueryElement";

export enum SQLOperator {
    EQUAL = '=',
    SPACESHIP = '<=>',
    NOT_EQUAL = '!=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    IS_NULL = 'is null',
    IS_NOT_NULL = 'is not null',
    IS = 'is',
    IS_NOT = 'is not',
    IN = 'in',
    NOT_IN = 'not in',
    LIKE = 'like',
    NOT_LIKE = 'not like'
}

export default class QueryCondition implements QueryElement {
    constructor(
        public readonly left: any,
        public readonly operator: SQLOperator,
        public readonly right: any,
        public readonly not: boolean = false
    ) {}
    hasRight(): boolean {
        switch(this.operator) {
            case SQLOperator.IS_NULL:
            case SQLOperator.IS_NOT_NULL: {
                return false
            }
        }
        return true
    }
}