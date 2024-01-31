import Model from "../Model";
import ORM from "../ORM";
import Query from "./Query";
import QueryColumn from "./QueryColumn";
import QueryCondition, { SQLOperator } from "./QueryCondition";
import QueryConjunction, { QueryConjunctionOperator } from "./QueryConjunction";
import QueryElement from "./QueryElement";
import QueryExists from "./QueryExists";
import QueryLike from "./QueryLike";

export default class QueryGroup<T extends Model> implements QueryElement, QueryLike<T> {
    
    constructor(private elements: QueryElement[] = []) {}
    
    public getElements(): QueryElement[] {
        return this.elements
    }

    public where(left: any, operator: string, right: any): this {
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.AND))
        }
        if(typeof left == 'string') {
            left = new QueryColumn(left as string)
        }
        this.elements.push(new QueryCondition(left, operator as SQLOperator, right))
        return this
    }

    public whereEq(left: any, right: any): this {
        return this.where(left, '=', right)
    }

    public whereLike(left: any, right: any): this {
        return this.where(left, 'like', right)
    }

    public whereNotLike(left: any, right: any): this {
        return this.where(left, 'not like', right)
    }

    public whereNull(left: any): this {
        return this.where(left, 'is null', null)
    }

    public whereNotNull(left: any): this {
        return this.where(left, 'is not null', null)
    }

    public whereIn(left: any, right: any[]): this {
        return this.where(left, 'in', right)
    }

    public whereNotIn(left: any, right: any[]): this {
        return this.where(left, 'not in', right)
    }

    public whereExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        let q = new Query<Q>(ORM.getRepo(model), model)
        q = group(q)
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.AND))
        }
        this.elements.push(new QueryExists(q, false))
        return this
    }

    public whereNotExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        let q = new Query<Q>(ORM.getRepo(model), model)
        q = group(q)
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.AND))
        }
        this.elements.push(new QueryExists(q, true))
        return this
    }

    public whereGroup(group: (q: QueryGroup<T>) => QueryGroup<T>): this {
        let g = new QueryGroup()
        g = group(g)
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.AND))
        }
        this.elements.push(g)
        return this
    }

    public orWhere(left: any, operator: string, right: any): this {
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.OR))
        }
        this.elements.push(new QueryCondition(left, operator as SQLOperator, right))
        return this
    }

    public orWhereEq(left: any, right: any): this {
        return this.orWhere(left, '=', right)
    }

    public orWhereLike(left: any, right: any): this {
        return this.orWhere(left, 'like', right)
    }

    public orWhereNotLike(left: any, right: any): this {
        return this.orWhere(left, 'not like', right)
    }

    public orWhereNull(left: any): this {
        return this.orWhere(left, 'is null', null)
    }

    public orWhereNotNull(left: any): this {
        return this.orWhere(left, 'is not null', null)
    }

    public orWhereIn(left: any, right: any[]): this {
        return this.orWhere(left, 'in', right)
    }

    public orWhereNotIn(left: any, right: any[]): this {
        return this.orWhere(left, 'not in', right)
    }

    public orWhereExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        let q = new Query<Q>(ORM.getRepo(model), model)
        q = group(q)
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.OR))
        }
        this.elements.push(new QueryExists(q, false))
        return this
    }

    public orWhereNotExists<Q extends Model>(model: any, group: (q: Query<Q>) => Query<Q>): this {
        let q = new Query<Q>(ORM.getRepo(model), model)
        q = group(q)
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.OR))
        }
        this.elements.push(new QueryExists(q, true))
        return this
    }

    public orWhereGroup(group: (q: QueryGroup<T>) => QueryGroup<T>): this {
        let g = new QueryGroup()
        g = group(g)
        if(this.elements.length > 0) {
            this.elements.push(new QueryConjunction(QueryConjunctionOperator.OR))
        }
        this.elements.push(g)
        return this
    }

}