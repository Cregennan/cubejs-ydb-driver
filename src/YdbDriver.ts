import {
    BaseDriver,
    DatabaseStructure,
    DriverInterface,
    QueryOptions,
    QuerySchemasResult,
    SchemaStructure,
    StreamOptions,
    StreamTableData,
    TableColumn,
    TableQueryResult,
} from '@cubejs-backend/base-driver';
import {PassThrough} from "stream";
import {Driver, getCredentialsFromEnv, ResultSet, RowType, Ydb} from "ydb-sdk";
import {YdbDriverQuery} from './YdbDriverQuery';
import Syntax = Ydb.Query.Syntax;
import {fromPrimitiveYqlType, restoreStringFromUnicode} from "./utils";

const DefaultWaitForDriverReadyTimeMs = 10000;

export type YdbDriverConfiguration = {
    endpoint: string
    database: string
}

export class YdbDriver<Config extends YdbDriverConfiguration = YdbDriverConfiguration>
    extends BaseDriver implements DriverInterface {

    private driver: Driver;
    private config: YdbDriverConfiguration;

    static dialectClass(){
        return YdbDriverQuery;
    }

    public constructor(config: YdbDriverConfiguration) {
        super();

        const authService = getCredentialsFromEnv();
        this.config = config;
        this.driver = new Driver({connectionString: `${config.endpoint}?database=${config.database}`, authService: authService});
    }

    public async stream(query: string, values: unknown[], options: StreamOptions): Promise<StreamTableData> {

        // @ts-ignore
        return null;
    }

    async getTablesQuery(schemaName: string): Promise<TableQueryResult[]> {
        const directory = await this.driver.schemeClient.listDirectory("");
        if (schemaName !== directory.self?.name){
            return [];
        }

        return directory.children
            .filter((table) => !!table.name && !table.name.startsWith(".sys"))
            .map((table) => ({
                table_name: table.name,
                TABLE_NAME: table.name?.toUpperCase()
            } as TableQueryResult));
    }

    async getSchemas(): Promise<QuerySchemasResult[]> {
        const directory = await this.driver.schemeClient.listDirectory("");
        const name = directory.self?.name as string;
        return [{ schema_name: name }];
    }

    async tablesSchema(): Promise<DatabaseStructure> {
        const directory = await this.driver.schemeClient.listDirectory("");
        const tables = directory.children
            .filter((table) => !!table.name && !table.name.startsWith(".sys"))
            .map((table) => table.name as string);

        const schema : SchemaStructure = {};

        await this.driver.tableClient.withSession(async (session) => {
            for(let table of tables){
                let tableDescription = await session.describeTable(table);
                schema[table] = tableDescription.columns.map((columnMeta) => {
                    return {
                        name: columnMeta.name,
                        type: this.yqlToGeneticType(columnMeta.type),
                        attributes: this.yqlColumnAttributes(tableDescription, columnMeta)
                    } as TableColumn;
                });
            }
        });

        return {
            [this.config.database]: schema
        };
    }

    yqlToGeneticType(type: Ydb.IType | null | undefined) : string{
        if (type == null){
            return 'text';
        }

        const {
            decimalType,
            optionalType,
            pgType,
            typeId,
        } = type;

        if (typeId != null){
            return fromPrimitiveYqlType(typeId);
        }
        if (pgType != null){
            return pgType.typeName ?? 'text';
        }
        if (decimalType != null){
            return 'double';
        }
        if (optionalType != null){
            return this.yqlToGeneticType(optionalType.item);
        }
        return 'text';
    }

    yqlColumnAttributes(table: Ydb.Table.DescribeTableResult, column: Ydb.Table.IColumnMeta) : string[] | null{
        let attr = [];
        if (table.primaryKey.includes(column.name as string)){
            attr.push('primaryKey');
        }
        return attr;
    }

    public async query(query: string, values?: unknown[], options?: QueryOptions): Promise<any[]> {
        return await this.queryInternal(query);
    }

    public async testConnection(): Promise<void> {
        await this.queryInternal(`SELECT "1";`, Ydb.Query.Syntax.SYNTAX_YQL_V1);
    }

    public async release(): Promise<void> {
        return await this.driver.destroy();
    }

    async queryInternal(query: string, syntax: Ydb.Query.Syntax = Syntax.SYNTAX_PG) {
        return this.driver.queryClient.do({
            fn: async (session) => {
                const {resultSets: results} = await session.execute({
                    text: query,
                    syntax: syntax,
                    rowMode: RowType.Ydb
                });
                const firstSet: ResultSet = (await results.next()).value;
                return await this.processQueryResult(firstSet);
            }
        })
    }

    async processQueryResult(result: ResultSet){
        const columns = result.columns.map((column) => {
            if (column instanceof Ydb.Column) {
                return column.name;
            }
            return column as string;
        });
        let rows: Ydb.Value[] = [];
        for await (let row of result.rows) {
            rows.push(row as Ydb.Value);
        }
        const mapping =  rows.map((row) => {
            const rowObj : { [p: string]: string }= {};
            row.items.forEach((item, i) => {
                // @ts-ignore
                rowObj[columns[i]] = restoreStringFromUnicode(item.textValue);
            })
            return rowObj;
        });
        return mapping;
    }
}
