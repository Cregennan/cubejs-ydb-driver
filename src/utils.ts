import {Ydb} from "ydb-sdk";

export function fromPrimitiveYqlType(type: Ydb.Type.PrimitiveTypeId) : string{
    switch(type){
        default: return 'text';
        case Ydb.Type.PrimitiveTypeId.PRIMITIVE_TYPE_ID_UNSPECIFIED: return 'text';
        case Ydb.Type.PrimitiveTypeId.BOOL: return 'boolean';
        case Ydb.Type.PrimitiveTypeId.INT8: return 'int';
        case Ydb.Type.PrimitiveTypeId.UINT8: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.INT16: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.UINT16: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.INT32: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.UINT32: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.INT64: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.UINT64: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.FLOAT: return 'float';
        case Ydb.Type.PrimitiveTypeId.DOUBLE: return 'double';
        case Ydb.Type.PrimitiveTypeId.DATE: return 'date';
        case Ydb.Type.PrimitiveTypeId.DATETIME: return 'timestamp';
        case Ydb.Type.PrimitiveTypeId.TIMESTAMP: return 'timestamp';
        case Ydb.Type.PrimitiveTypeId.INTERVAL: return 'bigint';
        case Ydb.Type.PrimitiveTypeId.TZ_DATE: return 'timestamp';
        case Ydb.Type.PrimitiveTypeId.TZ_DATETIME: return 'timestamp';
        case Ydb.Type.PrimitiveTypeId.TZ_TIMESTAMP: return 'timestamp';
        case Ydb.Type.PrimitiveTypeId.STRING: return 'text';
        case Ydb.Type.PrimitiveTypeId.UTF8: return 'text';
        case Ydb.Type.PrimitiveTypeId.YSON: return 'json';
        case Ydb.Type.PrimitiveTypeId.JSON: return 'json';
        case Ydb.Type.PrimitiveTypeId.UUID: return 'text';
        case Ydb.Type.PrimitiveTypeId.JSON_DOCUMENT: return 'json';
        case Ydb.Type.PrimitiveTypeId.DYNUMBER: return 'text';
    }
}

export function restoreStringFromUnicode(value: string | null){
    if (value == null){
        return null;
    }

    const decoder = new TextDecoder();

    if (!value.startsWith('\\x')) {
        return value;
    }
    let bytes = [];
    value = value.substring(2);
    for(let i = 0; i < value.length; i+=2){
        bytes.push(parseInt(value.slice(i, i+2), 16));
    }

    return decoder.decode(new Uint8Array(bytes))
}