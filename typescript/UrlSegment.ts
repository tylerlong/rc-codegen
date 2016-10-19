import {camelCase} from 'lodash';
import {readFileSync} from 'fs';
import {resolve, dirname} from 'path';
import Definition from './Definition';
import {Operation} from '../common/swagger';
import {PascalCase} from '../common/util';
import resolveType from './jsonType2Ts';

let configPath = __dirname + '/config/config.json';
let config = require(configPath);

export default class UrlSegment {
    urlName: string;
    name: string;
    methodName: string;
    defaultValue: string;
    valueDesc: string;
    valuePresence: 'optional' | 'required' | 'forbidden';
    children: UrlSegment[];

    operations: TsOperation[];

    definitions: Definition[];

    imports: { [importName: string]: string };

    constructor(urlName: string) {
        this.urlName = urlName;
        this.name = PascalCase(urlName);
        this.methodName = camelCase(this.name);
        this.children = [];
        //this.nodeImports = [];
        this.operations = [];
        this.definitions = [];
        this.imports = {};
    }

    /**
     * Special cases:
     *  parse post: body, query
     *  lookup post: query
     */
    addOperation(operation: Operation) {
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
            tsOprt.bodyParamName = 'null';
        }
        if (operation.queryType) {
            tsOprt.queryParamName = 'query';
            params.push(tsOprt.queryParamName + '?:' + operation.queryType);
        } else {
            tsOprt.queryParamName = 'null';
        }
        tsOprt.paramsDeclar = params.join(', ');

        // Imports, and some Special types
        if (operation.method == 'list') {
            let listDef = operation.definitions[operation.responseType];
            delete operation.definitions[operation.responseType];
            let listItemType = resolveType(listDef.properties['records']).refs[0];
            operation.responseType = `PagingResult<${listItemType}>`;
            this.addDefImports([listItemType, 'PagingResult']);
        }
        if (!operation.definitions[operation.bodyType]) {
            this.addDefImports([operation.bodyType]);
        }
        if (!operation.definitions[operation.responseType] && operation.method != 'list') {
            this.addDefImports([operation.responseType]);
        }
        if (tsOprt.responseType == 'Binary') {
            tsOprt.responseType = 'Response';
        }
        if (!tsOprt.responseType) {
            tsOprt.responseType = 'void';
        }


        // Definitions
        for (let name in operation.definitions) {
            let def = new Definition(operation.definitions[name], name);
            this.definitions.push(def);
            this.addDefImports(def.imports);
        }

        // Custom body,imports for operation methods
        let customBody = config.customOperations[this.name];
        if (customBody && customBody[operation.method]) {
            let custom = customBody[operation.method];
            try {
                for (let imp in custom.imports) {
                    this.imports[imp] = custom.imports[imp];
                }
                tsOprt.customBody = readFileSync(resolve(dirname(configPath), custom.body)).toString();
            } catch (e) {
                console.error('Fail to resolve custom body', e);
            }
        }

        this.operations.push(tsOprt);
    }

    addDefImports(imports: string[]) {
        for (let imp of imports) {
            if (UserDefinedTypes.indexOf(imp) > -1) {
                this.imports[imp] = '../../' + imp;
            } else if (imp) {
                this.imports[`{${imp}}`] = '../' + imp;
            }
        }
    }

    addChild(child: UrlSegment) {
        if (this.children.indexOf(child) == -1) {
            this.children.push(child);
            this.imports[child.name] = './' + child.name;
        }
    }

    allowValue() {
        if (!this.valuePresence) {
            this.valuePresence = 'required';
        } else if (this.valuePresence == 'forbidden') {
            this.valuePresence = 'optional';
        }
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
    customBody: string;
}

const UserDefinedTypes = ['Binary', 'PagingResult'];