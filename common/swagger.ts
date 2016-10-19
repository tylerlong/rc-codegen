import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import isList from './is-list-type';

enum HasId {
  Unknown = -2,
  No = -1,
  Maybe = 0,
  Yes = 1
}

// read swagger definition
const swagger: any = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf-8'));

// all the paths defined in swagger
const paths: string[] = Object.keys(swagger.paths);

// tokenize the paths above
const tokenss: string[][] = paths.map(path => path.split('/').filter(token => /^[a-z-]+$/i.test(token)));

// flatten the array above and remove duplicates
const segments = new Set<string>([].concat.apply([], tokenss));

// whether a segment could have an ID: No, Maybe or Yes
const segmentIds = new Map<string, HasId>();
const pathsStr = paths.join('\n');
for (const segment of segments) {
  const hasIdRegex = new RegExp(`/${segment}/(?:\{[^{}/]+\}|v1\.0)(?:/|$)`, 'm');
  const noIdRegex = new RegExp(`/${segment}(?:$|/[a-z]{2,})`, 'm');
  let hasId = HasId.Unknown;
  if (hasIdRegex.test(pathsStr)) {
    hasId = HasId.Maybe;
    if (!noIdRegex.test(pathsStr)) {
      hasId = HasId.Yes;
    }
  } else {
    hasId = HasId.No;
  }
  segmentIds.set(segment, hasId);
}

// each segment and their children
const children = new Map<string, Set<string>>();
for (const segment of segments) {
  children.set(segment, new Set<string>());
}
for (const tokens of tokenss) {
  for (let i = 1; i < tokens.length; i++) {
    children.get(tokens[i - 1]).add(tokens[i]);
  }
}

// actions
const actions = new Map<string, any[]>();
for (const path of paths) {
  const segment = _.last(path.split('/').filter(token => /^[a-z-]+$/i.test(token)));
  const pathBody = swagger.paths[path];
  const methods = actions.get(segment) || []; // get, post, put, delete, list
  for (let method of Object.keys(pathBody)) {
    if (method == 'parameters') {
      continue;
    }
    const methodBody = pathBody[method];
    if (method == 'get') {
      if (path == '/restapi') {
        method = 'list';
      }
      const schema = methodBody.responses.default.schema;
      if (isList(schema)) {
        method = 'list';
      }
    }
    if (_.find(methods, function (m) { return m.method == method; })) {
      continue; // already have this method, such as get account/phone-number and get extension/phone-number
    }
    const description = methodBody.description;

    const definitions = {};
    let parametersName = ''
    let parameters: Array<any> = methodBody.parameters;
    if (parameters != undefined) {
      // request body
      const bodyParameter = parameters.find((item) => item.name == 'body');
      if (bodyParameter != undefined) {
        parametersName = `${_.upperFirst(method)}Parameters`;
        if (bodyParameter.schema['enum'] !== undefined) { // special case: Extension post
          parametersName = 'ExtensionParameters'
        } else if (bodyParameter.schema['$ref'] !== undefined) {
          parametersName = _.last((bodyParameter.schema['$ref'] as string).split('/'));
        } else {
          definitions[parametersName] = bodyParameter.schema; // just like an entry in swagger definitions
        }
      }
      // query parameters
      parameters = parameters.filter(item => item.in == 'query');
      if (parameters.length > 0) {
        const result = { properties: {} };
        for (const parameter of parameters) {
          result.properties[parameter.name] = parameter;
        }
        parametersName = `${_.upperFirst(method)}Parameters`;
        definitions[parametersName] = result;
      }
    }

    // response
    const responseBody = methodBody.responses.default.schema;
    let responseName = `${_.upperFirst(method)}Response`
    if (responseBody === undefined) {
      responseName = '' // no response body
    } else {
      if (responseBody['$ref'] === undefined) {
        definitions[responseName] = responseBody; // just like an entry in swagger definitions
      } else {
        responseName = _.last((responseBody['$ref'] as string).split('/'));
      }
    }

    methods.push({ method, description, definitions, responseName, parametersName });
  }
  actions.set(segment, methods);
}

// get, list, post, put
interface Operation {
  description: string;
  method: string;
  bodyType: string;
  queryType: string;
  responseType: string;
  definitions?: { [name: string]: any };  // json schema
}

let operations = new Map<string, Operation[]>();  // Used in typescript now.
for (const path of paths) {
  const segment = _.last(path.split('/').filter(token => /^[a-z-]+$/i.test(token)));
  const pathBody = swagger.paths[path];
  const methods = operations.get(segment) || []; // get, post, put, delete, list
  for (let method of Object.keys(pathBody)) {
    if (method == 'parameters') {
      continue;
    }
    const methodBody = pathBody[method];
    if (method == 'get' && isList(methodBody.responses.default.schema)) {
      method = 'list';
    }
    if (_.find(methods, m => m.method == method)) {
      console.warn(`Operation already defined for ${method} ${segment}`);
      continue; // already have this method, such as get account/phone-number and get extension/phone-number
    }
    const description = methodBody.description;

    const definitions = {};
    let bodyType: string;
    let queryType: string;
    let parameters: Array<any> = methodBody.parameters;
    if (parameters != undefined) {
      // request body
      const bodyParameter = parameters.find((item) => item.name == 'body');
      if (bodyParameter) {
        if (bodyParameter.schema['$ref']) {
          bodyType = _.last((bodyParameter.schema['$ref'] as string).split('/'));
        } else {
          bodyType = `${_.upperFirst(method)}Body`;
          definitions[bodyType] = bodyParameter.schema; // just like an entry in swagger definitions
        }
      }
      // query parameters
      parameters = parameters.filter(item => item.in == 'query');
      if (parameters.length > 0) {
        queryType = `${_.upperFirst(method)}Query`;
        const result = { type: 'object', properties: {} };  // Query type schema
        for (const parameter of parameters) {
          result.properties[parameter.name] = parameter;
        }
        definitions[queryType] = result;
      }
    }

    // response
    const responseSchema = methodBody.responses.default.schema;
    let responseType = `${_.upperFirst(method)}Response`
    if (!responseSchema) {
      responseType = '' // no response body, delete methods may not have response.
    } else {
      if (responseSchema['$ref']) {
        responseType = responseSchema['$ref'].split('/').pop();
      } else {
        definitions[responseType] = responseSchema;
      }
    }

    methods.push({ method, description, bodyType, queryType, responseType, definitions });
  }
  operations.set(segment, methods);
}

export { swagger, segments, children, segmentIds, actions, Operation, operations };
