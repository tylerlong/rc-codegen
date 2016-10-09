import {PascalCase} from '../common/util';

interface TsTypeInfo {
    name: string;   // The string representation of the type
    category: 'primitive' | 'ref' | 'enum' | 'object' | 'binary';  // object maybe interface or class
    enum?: string[];    // For String Literal Types
    refs?: string[];
}

const STRING_QUOTE = '"';

// Convert json schema type to TS type
export default function resolveJsonType(schemaProp, typeName?: string): TsTypeInfo {
    if (schemaProp.type == 'integer') {
        return { name: 'number', category: 'primitive' };
    } else if (schemaProp['$ref']) {
        let n = PascalCase(schemaProp['$ref'].split('/').pop());
        return { name: n, category: 'ref', refs: [n] };
    } if (schemaProp.enum) {
        if (schemaProp.type == 'string') {
            return { name: STRING_QUOTE + schemaProp.enum.join(STRING_QUOTE + ' | ' + STRING_QUOTE) + STRING_QUOTE, category: 'enum', enum: schemaProp.enum };
        } else if (schemaProp.type == 'object') {
            let types = [], refs = [];
            schemaProp.enum.forEach(function (t) {
                let ti = resolveJsonType(t);
                types.push(ti.name);
                ti.refs && (refs = refs.concat(ti.refs));
            });
            return { name: types.join(' | '), category: 'enum', refs: refs };
        } else {
            console.error("Unexpected enum type", schemaProp);
        }
    } else if (schemaProp.type == 'array') {
        let itemType = resolveJsonType(schemaProp.items);
        itemType.name += '[]';
        return itemType;
    } else if (schemaProp.type == 'object') {   // FIXME donot use external name?
        return { name: typeName, category: 'object' };
    } else if (schemaProp.format == 'binary') {
        return { name: 'ArrayBuffer', category: 'binary' };
    } else {
        return { name: schemaProp.type, category: 'primitive' };
    }
};