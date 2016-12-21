import { PascalCase } from '../common/util';
import resolveType from './jsonType2Ts';

// The Definition data for nunjucks
export default class Definition {
  name: string;
  imports: string[];
  fields: Field[];

  constructor(schema: any, name: string) {
    if (schema.type != 'object') {
      throw new TypeError("Type of definition must be object.");
    }

    this.name = PascalCase(name);
    this.imports = [];
    this.fields = [];

    if (schema.enum) {

    }

    let imports = {};
    for (let p in schema.properties) {
      var propVal = schema.properties[p];
      var typeInfo = resolveType(propVal, PascalCase(p));
      this.fields.push({
        type: typeInfo.name,
        comment: propVal.description,
        name: p
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
