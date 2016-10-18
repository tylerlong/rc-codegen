import UrlSegment from './UrlSegment';
import resolveType from './jsonType2Ts';
import Definition from './Definition';
import isListResponse from './plugins/is-list-response';

let config = require('./config.json');

/* Get CRUD operation method. */
export default function (classes: {[name:string]: UrlSegment}, paths) {
    for (let p in paths) {
        let cls = classes[resolveUrlEntity(p)];
        if (!cls) {
            console.warn('No class found for ' + p);
            continue;
        }
        let getOperation = paths[p].get;
        if (getOperation && config.getIngore.indexOf(cls.urlName) == -1) {
            addGetOperation(cls, getOperation);
        }
        let postOperation = paths[p].post;
        if (postOperation && config.postIgnore.indexOf(cls.urlName) == -1) {
            addOperation(cls, postOperation, 'post');
        }
        let putOperation = paths[p].put;
        if (putOperation && config.putIgnore.indexOf(cls.urlName) == -1) {
            addOperation(cls, putOperation, 'put');
        }
        let deleteOperation = paths[p]['delete'];
        if (deleteOperation) {
            addOperation(cls, deleteOperation, 'delete');
        }
    }
};

function addOperation(cls: UrlSegment, operation, method: string) {
    let schema = operation.responses.default.schema;
    let operationKey = method + 'Method';
    let operationMethod = cls[operationKey] = {
        comment: operation.description,
        resType: '',
        body: '',
        queryParams: '',
        bodyParams:'',
        reqBodyIsBinary: false
    };
    if (!schema) {
        operationMethod.resType = '';
    }

    // try to use hand written methods
    try {
        let customMethod = config.urlBuilders[cls.name][operationKey];
        for (let imp in customMethod.nodeImports) {
            cls.nodeImports[imp] = customMethod.nodeImports[imp];
        }
        for (let imp in customMethod.modelTypes) {
            cls.modelTypes[imp] = true;
        }
        operationMethod.body = customMethod.body;
        return;
    } catch (e) {
        // No customMethod
    }

    let params = operation.parameters;
    if (!params) {
        operationMethod.queryParams = '{}';
        operationMethod.bodyParams = '';
        return;
    }

    // Body parameter type: object, ref, primitive type(string)
    let bodyParams = [];
    let queryParams = {};
    for (let i = 0; i < params.length; i++) {
        let p = params[i];
        if (p['in'] == 'body') {
            bodyParams.push(p);
        } else if (p['in'] == 'query') {
            if (queryParams[p.name]) {
                console.error('Duplicated query parameter ' + p.name);
            }
            queryParams[p.name] = p;
        } else {
            console.error('Unexpected ' + method + ' request parameter in ' + p['in'], p);
        }
    }

    // 1. bodyParams
    if (bodyParams.length == 1) {
        let bodyParam = bodyParams[0];
        let typeInfo = resolveType(bodyParam.schema);
        if (typeInfo.refs) {
            operationMethod.bodyParams = typeInfo.name;
            cls.modelTypes[typeInfo.refs[0]] = true;
        } else if (typeInfo.refs) {
            operationMethod.bodyParams = typeInfo.name;
            typeInfo.refs.forEach(function(imp) {
                cls.modelTypes[imp] = true;
            });
        } else if (typeInfo.category == 'object') {
            let bodyDef = toOptionsDef(bodyParam.schema.properties, '        ');
            operationMethod.bodyParams = bodyDef.def;
            let imports = bodyDef.imports;
            imports.forEach(function (imp) {
                cls.modelTypes[imp] = true;
            });
        } else if (typeInfo.category == 'binary') {
            operationMethod.reqBodyIsBinary = true;
        } else {
            console.error(method + " " + cls.urlName + ": Unexpected body parameter type", bodyParams);
        }
    } else if (bodyParams.length == 0) {
        operationMethod.bodyParams = '';
    } else if (method != 'delete') {
        console.error("Number of " + method + " body parameters must be 1, the " + method + " operation.", operation)
    }

    // 2. queryParams
    let queryDef = toOptionsDef(queryParams, '        ');
    operationMethod.queryParams = queryDef.def;
    // Since queryParams are primitives, no imports
    if (queryDef.imports.length > 0) {
        console.error('Type query parameter must be primitive', operation);
    }

    // Handle Response
    let resSchema = operation.responses.default.schema;
    if (!resSchema) {
        return;
    }
    let typeInfo = resolveType(resSchema, cls.name + uppercamelcase(method) + 'Response');
    if (typeInfo.refs) {
        cls.modelTypes[typeInfo.refs[0]] = true;
        operationMethod.resType = typeInfo.refs[0];
    } else if (typeInfo.category == 'object') {
        operationMethod.resType = typeInfo.name;
        let modelDef = new Definition(resSchema, typeInfo.name);
        cls.innerTypes = cls.innerTypes.concat(modelDef);
        for (let imp in modelDef.imports) {
            cls.modelTypes[imp] = true;
        }
    } else {
        console.error("Unexpected " + method + " response type", operation);
    }
}

// return {def:string, imports:}
function toOptionsDef(props, paddingLeft) : {def:string; imports: string[]} {
    let imports = [];
    let propDefs = [];
    for (let propName in props) {
        let typeInfo = resolveType(props[propName]);
        propDefs.push(' /** ' + (props[propName].description || '') + ' */');
        propDefs.push(propName + "?: " + typeInfo.name + ';');
        typeInfo.refs && imports.push(typeInfo.refs[0]);
    }
    if (propDefs.length < 1) {
        return { def: '{}', imports: imports };
    }
    return { def: '{\n' + paddingLeft + propDefs.join('\n' + paddingLeft) + '\n    }', imports: imports };
}

function addGetOperation(cls: UrlSegment, getOperation) {
    if (isListResponse(getOperation.responses.default.schema)) {
        addListOperation(cls, getOperation);
        return;
    }
    cls.getMethod = {
        comment: getOperation.description
    };
    let resSchema = getOperation.responses.default.schema;
    let typeInfo = resolveType(resSchema, cls.name + 'GetResponse');
    if (typeInfo.refs) {
        cls.modelTypes[typeInfo.refs[0]] = true;
        cls.modelType = typeInfo.name;
    } else if (typeInfo.category == 'object') {
        if (cls.modelType) {
            console.warn('Model type exists for ', cls);
            return;
        }
        cls.modelType = typeInfo.name;
        let modelDef = new Definition(resSchema, typeInfo.name);
        cls.innerTypes = cls.innerTypes.concat(modelDef);
        for (let imp in modelDef.imports) {
            cls.modelTypes[imp] = true;
        }
    } else if (resSchema.format == 'binary' && resSchema.type == 'string') {
        cls.modelType = 'Response';
        cls.getReturnBinary = true;
    } else {
        console.error('Unknown get response type.', getOperation.responses.default);
    }
}

function addListOperation(cls: UrlSegment, getOperation) {
    let parameters = {};
    cls.listMethod = {
        comment: getOperation.description,
        parameters: null
    };
    if (!cls.modelType) {
        cls.modelType = resolveType(getOperation.responses.default.schema.properties.records).refs[0];
        cls.modelTypes[cls.modelType] = true;
    }
    if (!getOperation.parameters) {
        return;
    }
    parameters = cls.listMethod.parameters = {};
    getOperation.parameters.forEach(function (p) {
        if (p.in != 'query') {
            console.warn('List Operation allow none query parameters', p);
            return;
        }
        parameters[p.name] = {
            type: resolveType(p).name,
            comment: p.description
        };
    });
}

function resolveUrlEntity(url) {
    let parts = url.split("/");
    let last = parts[parts.length - 1];
    if (last.match(/^{(.+)}$/)) {
        return parts[parts.length - 2];
    }
    return last;
}