import QueryStringRenderer from "./QueryStringRenderer";
import { SQLValue } from "../connection/SQL";
import SQLQueryString from "./SQLQueryString";
import Query from "../query/Query";
import Model from "../Model";
import TableInfo from "../TableInfo";
import QueryGroup from "../query/QueryGroup";
import QueryCondition from "../query/QueryCondition";
import QueryElement from "../query/QueryElement";
import QueryConjunction from "../query/QueryConjunction";
import QueryExists from "../query/QueryExists";
import QueryColumn from "../query/QueryColumn";

const MAX_INT = Math.pow(2, 31)

export default class MySQLQueryStringRenderer<T extends Model> implements QueryStringRenderer<T> {

    renderInsert(info: TableInfo, values: Record<string, SQLValue>): SQLQueryString {
        let query = 'INSERT INTO `' + info.getTableName() + '` ('
        query += Object.keys(values).map(k => '`' + k + '`').join(',')
        query += ') VALUES ('
        query += Object.keys(values).map(k => '?').join(',')
        query += ');'
        return { query, parameters: Object.values(values) }
    }

    renderQuery(query: Query<Model>): SQLQueryString {
        const repo = query.getRepo()
        const info = repo.getInfo()
        let sb = 'SELECT '
        if(query.getSelect().length == 0) {
            sb += '*'
        } else {
            sb += query.getSelect().map(c => c.buildString(info)).join(',')
        }
        sb += ' FROM `' + info.getTableName() + '`'
        const params = []
        let where = query.getWhereGroup()
        if(query.shouldApplyAccessible()) {
            let accessChecks = new QueryGroup()
            if(repo.getAccessible() != null) {
                accessChecks = repo.getAccessible()(query, accessChecks, query.getAccessor())
            } else {
                accessChecks = accessChecks.whereEq(1, 2)
            }
            const actualWhere = where
            where = new QueryGroup()
            if(actualWhere.getElements().length > 0) {
                where = where.whereGroup(q => actualWhere)
            }
            if(accessChecks.getElements().length > 0) {
                where = where.whereGroup(q => accessChecks)
            }
        }
        if(where.getElements().length > 0) {
            const qs = this.convertGroup(info, where)
            sb += ' WHERE ' + qs.query
            params.push(...qs.parameters)
        }
        if(query.getGroupBy().length > 0) {
            sb += ' GROUP BY '
            sb += query.getGroupBy().map(c => c.buildString(info)).join(',')
        }
        if(query.getHavingGroup() && query.getHavingGroup().getElements().length > 0) {
            const qs = this.convertGroup(info, query.getHavingGroup())
            sb += ' HAVING ' + qs.query
            params.push(...qs.parameters)
        }
        if(query.getOrderBy().length > 0) {
            sb += ' ORDER BY '
            sb += query.getOrderBy().map(o => o.column.buildString(info) + (o.desc ? ' DESC' : '')).join(',')
        }
        let offset = query.getOffset()
        let limit = query.getLimit()
        if(offset !== null && limit === null) {
            limit = MAX_INT
        }
        if(limit !== null) {
            sb += ' LIMIT ?'
            if(offset !== null) {
                sb += ',?'
                params.push(offset)
            }
            params.push(limit)
        }
        sb += ';'
        return { query: sb, parameters: params }
    }

    renderUpdate(query: Query<Model>, values: Record<string, SQLValue>): SQLQueryString {
        const info = query.getRepo().getInfo()
        let sb = 'UPDATE `' + info.getTableName() + '` SET '
        sb += Object.keys(values).map(k => '`' + k + '`=?').join(',')
        const params = [...Object.values(values)]
        const where = query.getWhereGroup()
        if(where.getElements().length > 0) {
            const qs = this.convertGroup(info, where)
            sb += ' WHERE ' + qs.query
            params.push(...qs.parameters)
        }
        sb += ';'
        return { query: sb, parameters: params }
    }
    
    renderDelete(query: Query<Model>): SQLQueryString {
        const info = query.getRepo().getInfo()
        let sb = 'DELETE FROM `' + info.getTableName() + '`'
        const params = []
        const where = query.getWhereGroup()
        if(where.getElements().length > 0) {
            const qs = this.convertGroup(info, where)
            sb += ' WHERE ' + qs.query
            params.push(...qs.parameters)
        }
        sb += ';'
        return { query: sb, parameters: params }
    }

    private convertElement(info: TableInfo, element: QueryElement): SQLQueryString {
        if(element instanceof QueryConjunction) {
            return { query: element.operator, parameters: [] }
        }
        if(element instanceof QueryGroup) {
            return this.convertGroup(info, element)
        }
        if(element instanceof QueryCondition) {
            return this.convertCondition(info, element)
        }
        if(element instanceof QueryExists) {
            const qs = this.renderQuery(element.query)
            return {
                query: (element.not ? 'NOT ' : '') + 'EXISTS (' + qs.query + ')',
                parameters: qs.parameters
            }
        }
        return null
    }

    private convertGroup(info: TableInfo, group: QueryGroup<Model>): SQLQueryString {
        let sb = '('
        const params = []
        for(let e of group.getElements()) {
            if(sb.length > 1) {
                sb += ' '
            }
            const qs = this.convertElement(info, e)
            sb += qs.query
            params.push(...qs.parameters)
        }
        sb += ')'
        return { query: sb, parameters: params }
    }

    private convertCondition(info: TableInfo, condition: QueryCondition): SQLQueryString {
        let sb = ''
        const params = []
        if(condition.not) {
            sb += 'NOT '
        }
        if(condition.left instanceof QueryColumn) {
            sb += condition.left.buildString(info)
        } else {
            sb += '?'
            params.push(condition.left)
        }
        sb += ' '
        sb += condition.operator
        if(condition.hasRight()) {
            sb += ' '
            if(condition.operator.endsWith('in')) {
                sb += '(' + condition.right.map(() => '?').join(',') + '?'
                params.push(...condition.right)
            } else if (condition.right instanceof QueryColumn) {
                sb += condition.right.buildString(info)
            } else {
                sb += '?'
                params.push(condition.right)
            }
        }
        return { query: sb, parameters: params }
    }

}