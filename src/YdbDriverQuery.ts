import {BaseQuery} from "@cubejs-backend/schema-compiler";

export class YdbDriverQuery extends BaseQuery{

    cubeDataSource(cube: any): any {
        return super.cubeDataSource(cube);
    }

    cubeSql(cube: any): any {
        return super.cubeSql(cube);
    }

    rewriteInlineCubeSql(cube: any, isLeftJoinCondition: any): any[] {
        return super.rewriteInlineCubeSql(cube, isLeftJoinCondition);
    }

    preAggregationTableName(cube: any, preAggregationName: any, skipSchema: any): string {
        return super.preAggregationTableName(cube, preAggregationName, skipSchema);
    }

    cubeAlias(cubeName: string): string {
        return super.cubeAlias(cubeName);
    }

    withCubeAliasPrefix(cubeAliasPrefix: any, fn: any): any {
        return super.withCubeAliasPrefix(cubeAliasPrefix, fn);
    }

    autoPrefixWithCubeName(cubeName: any, sql: any, isMemberExpr?: boolean): any {
        return super.autoPrefixWithCubeName(cubeName, sql, isMemberExpr);
    }
}