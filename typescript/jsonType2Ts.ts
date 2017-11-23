import { PascalCase } from '../common/util';

interface TsTypeInfo {
  label: string;   // The string representation of the type
  category: 'primitive' | 'ref' | 'enum' | 'object' | 'binary';  // object maybe interface or class
  enum?: string[];    // For String Literal Types
  refs?: string[];
}

const STRING_QUOTE = '\'';

// Convert json schema type to TS type
export default function resolveJsonType(schemaProp, typeName?: string): TsTypeInfo {
  if (schemaProp.type == 'integer') {
    return { label: 'number', category: 'primitive' };
  } else if (schemaProp['$ref']) {
    let n = PascalCase(schemaProp['$ref'].split('/').pop());
    return { label: n, category: 'ref', refs: [n] };
  } if (schemaProp.enum) {
    if (schemaProp.type == 'string') {
      return { label: STRING_QUOTE + schemaProp.enum.join(STRING_QUOTE + ' | ' + STRING_QUOTE) + STRING_QUOTE, category: 'enum', enum: schemaProp.enum };
    } else if (schemaProp.type == 'object') {
      let types = [], refs = [];
      schemaProp.enum.forEach(function (t) {
        let ti = resolveJsonType(t);
        types.push(ti.label);
        ti.refs && (refs = refs.concat(ti.refs));
      });
      return { label: types.join(' | '), category: 'enum', refs: refs };
    } else if (schemaProp.type === 'array') {
      return { label: '(' + STRING_QUOTE + schemaProp.enum.join(STRING_QUOTE + ' | ' + STRING_QUOTE) + STRING_QUOTE + ')[]', category: 'enum', enum: schemaProp.enum };
    } else {
      console.error("Unexpected enum type", schemaProp);
    }
  } else if (schemaProp.type == 'array') {
    let itemType = resolveJsonType(schemaProp.items);
    itemType.label += '[]';
    return itemType;
  } else if (schemaProp.type == 'object') {   // FIXME donot use external name?
    return { label: typeName, category: 'object' };
  } else if (schemaProp.format == 'binary') {
    return { label: 'ArrayBuffer', category: 'binary' };
  } else {
    return { label: schemaProp.type, category: 'primitive' };
  }
};
