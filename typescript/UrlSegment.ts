import {camelCase} from 'lodash';
import Definition from './Definition';
import {PascalCase} from '../common/util';

export default class UrlSegment {
    urlName: string;
    name: string;
    methodName: string;
    defaultValue: string;
    valueDesc: string;
    valuePresence: 'optional' | 'required' | 'forbidden';
    children: UrlSegment[];

    nodeImports: string[];
    modelType: string;
    modelTypes: { [typeName: string]: boolean };
    innerTypes: Definition[];

    getMethod: { comment: string };
    getReturnBinary: boolean;
    listMethod: { comment: string, parameters: any };

    constructor(urlName: string) {
        this.urlName = urlName;
        this.name = PascalCase(urlName);
        this.methodName = camelCase(this.name);
        this.children = [];
        this.nodeImports = [];
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