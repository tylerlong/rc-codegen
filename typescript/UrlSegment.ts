import {camelCase} from 'lodash';
import Definition from './Definition';
import {Operation} from '../common/swagger';
import {PascalCase} from '../common/util';

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

    constructor(urlName: string) {
        this.urlName = urlName;
        this.name = PascalCase(urlName);
        this.methodName = camelCase(this.name);
        this.children = [];
        //this.nodeImports = [];
        this.operations = [];
        this.definitions = [];
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
        let params = [];
        if (operation.bodyType) {
            tsOprt.bodyParamName = 'body';
            params.push(tsOprt.bodyParamName + ': ' + operation.bodyType);
        } else {
            tsOprt.bodyParamName = 'null';
        }
        if (operation.queryType) {
            tsOprt.queryParamName = 'query';
            params.push(tsOprt.queryParamName + ':' + operation.queryType);
        } else {
            tsOprt.queryParamName = 'null';
        }
        tsOprt.paramsDeclar = params.join(', ');
        if (tsOprt.responseType == 'Binary') {
            tsOprt.responseType = 'Response';
        }
        this.operations.push(tsOprt);
        for (let name in operation.definitions) {
            this.definitions.push(new Definition(operation.definitions[name], name));
        }
    }

    addChild(child: UrlSegment) {
        if (this.children.indexOf(child) == -1) {
            this.children.push(child);
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
}