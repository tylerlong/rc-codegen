import { PascalCase, isLegalIdentifier } from '../common/util';
import resolveType from './jsonType2Ts';

// The Definition data for nunjucks
export default class Definition {
  name: string;
  imports: string[];
  fields: Field[];

  constructor(schema: any, name: string) {
    schema.type = schema.type || 'object';
    if (schema.type != 'object') {
      throw new TypeError("Type of definition must be object.");
    }

    this.name = PascalCase(name);
    this.imports = [];
    this.fields = [];

    if (schema.enum) {

    }

    for (let name in schema.properties) {
      if (!isLegalIdentifier(name)) {
        continue;
      }
      var propVal = schema.properties[name];
      var typeInfo = resolveType(propVal, PascalCase(name));
      this.fields.push({
        type: typeInfo.label,
        comment: propVal.description && propVal.description.trim(),
        name
      });
      if (typeInfo.refs) {
        this.addImports(typeInfo.refs);
      } else if (typeInfo.category == 'object') {
        console.error('Type of a property should not be object ', propVal);
      }
    }

    this.imports.sort();
  }

  addImports(refs: string[]) {
    refs.forEach(ref => {
      if (this.imports.indexOf(ref) == -1) {
        this.imports.push(ref);
      }
    });
  }
}

interface Field {
  comment: string;
  name: string;
  type: string;
}
