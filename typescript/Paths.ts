import { camelCase } from 'lodash';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import Definition from './Definition';
import { Operation } from '../common/swagger';
import { PascalCase } from '../common/util';
import resolveType from './jsonType2Ts';

export default class UrlSegment {
  urlName: string;
  name: string;
  methodName: string;
  defaultValue: string;
  valueDesc: string;
  valuePresence: 'optional' | 'required' | 'forbidden';
  children: UrlSegment[] = [];

  operations: TsOperation[] = [];

  definitions: Definition[] = [];
  enumTypes: EnumType[] = [];

  imports: Import[] = [];

  hasCustomMethods: boolean;

  codegenConfig: any;

  constructor(urlName: string, config) {
    this.urlName = urlName;
    this.name = PascalCase(urlName);
    this.methodName = camelCase(this.name);
    this.addDefImports(["PathSegment"]);
    this.codegenConfig = config;
  }

  /**
   * Special cases:
   *  parse post: body, query
   *  lookup post: query
   */
  addOperation(operation: Operation) {
    if (operation.method == 'list') {
      let listDef = operation.definitions[operation.responseType];
      delete operation.definitions[operation.responseType];
      let listItemType = resolveType(listDef.properties['records']).refs[0];
      operation.responseType = `PagingResult<${listItemType}>`;
      this.addDefImports([listItemType, 'PagingResult']);
    }
    // Definitions
    for (let name in operation.definitions) {
      let opDef = operation.definitions[name];
      let def = new Definition(opDef, name);
      if (def.fields.length > 0) {
        this.definitions.push(def);
        this.addDefImports(def.imports);
      } else if (opDef.enum) {
        let enumType = { name: name, types: [] };
        for (let e of opDef.enum) {
          let ti = resolveType(e);
          this.addDefImports(ti.refs);
          enumType.types.push(ti.name);
        }
        this.enumTypes.push(enumType);
      }
    }

    // Custom body,imports for operation methods
    let customOperations = this.codegenConfig.customOperations[this.name];
    if (customOperations && customOperations.indexOf(operation.method) > -1) {
      this.hasCustomMethods = true;
      return;
    }

    let tsOprt = <TsOperation>operation;
    tsOprt.httpMethod = operation.method;
    switch (operation.method) {
      case 'list': tsOprt.httpMethod = 'get'; break;
      case 'get':
      case 'post':
      case 'put':
      case 'delete': break;
      default:
        console.error('Unkown operation', operation);
        return;
    }

    // Method params
    let params = [];
    if (operation.bodyType) {
      tsOprt.bodyParamName = 'body';
      params.push(tsOprt.bodyParamName + ': ' + operation.bodyType);
    } else {
      tsOprt.bodyParamName = 'undefined';
    }
    if (operation.queryType) {
      tsOprt.queryParamName = 'query';
      params.push(tsOprt.queryParamName + '?: ' + operation.queryType);
    } else {
      tsOprt.queryParamName = 'undefined';
    }
    tsOprt.paramsDeclar = params.join(', ');

    // Imports, and some Special types
    if (!operation.definitions[operation.bodyType]) {
      operation.bodyType && this.addDefImports([operation.bodyType]);
    }
    if (!operation.definitions[operation.responseType] && operation.method != 'list' && operation.responseType != 'Binary') {
      operation.responseType && this.addDefImports([operation.responseType]);
    }
    if (tsOprt.responseType == 'Binary') {
      tsOprt.responseType = 'any';
    }
    if (!tsOprt.responseType) {
      tsOprt.responseType = 'void';
    }

    this.operations.push(tsOprt);
  }

  addDefImports(imports: string[]) {
    for (let defaultMember of imports) {
      let moduleName: string;
      if (UserDefinedTypes.indexOf(defaultMember) > -1) {
        moduleName = '../' + defaultMember;
      } else if (defaultMember) {
        moduleName = '../definitions/' + defaultMember;
      }
      this.addImport({ defaultMember, moduleName });
    }
  }

  addChild(child: UrlSegment) {
    if (this.children.indexOf(child) == -1) {
      this.children.push(child);
      this.addImport({ defaultMember: child.name, moduleName: './' + child.name });
    }
  }

  addImport(imp: Import) {
    if (!this.imports.find(v => v.defaultMember == imp.defaultMember)) {
      this.imports.push(imp);
    }
  }

  allowValue() {
    if (!this.valuePresence) {
      this.valuePresence = 'required';
    } else if (this.valuePresence == 'forbidden') {
      this.valuePresence = 'optional';
    }
  }

  /**
   * After this method is called, all the properties will not be changed.
   */
  freeze() {
    this.imports.sort((a, b) => {
      return a.moduleName.toLowerCase() < b.moduleName.toLowerCase() ? -1 : 1;
    });
  }

  forbidValue() {
    if (!this.valuePresence) {
      this.valuePresence = 'forbidden';
    } else if (this.valuePresence == 'required') {
      this.valuePresence = 'optional';
    }
  }
}

interface TsOperation extends Operation {
  paramsDeclar: string;
  bodyParamName: string;
  queryParamName: string;
  httpMethod: string;
}

const UserDefinedTypes = ['Binary', 'PagingResult', 'PathSegment'];

interface EnumType {
  name: string;
  types: string[];
}

interface Import {
  defaultMember: string;
  moduleName: string
}
