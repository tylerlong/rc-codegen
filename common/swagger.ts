import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as yaml from 'js-yaml';

import { isListType, PascalCase } from './util';

const split_path = (path: string): string[] => { // treat meeting/service-info as a whole
  return path.replace('/meeting/service-info', '/meeting-service-info').split('/').map((item) => {
    if (item == 'meeting-service-info') {
      return 'meeting/service-info';
    }
    return item;
  }).filter((item) => /^[a-z/-]+$/i.test(item));
}

enum HasId {
  Unknown = -2,
  No = -1,
  Maybe = 0,
  Yes = 1
}

// read swagger definition
const swagger: any = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf-8'));

// all the paths defined in swagger
let paths: string[] = Object.keys(swagger.paths);
paths = paths.filter(path => {
  const { get, post, put, delete: dlt } = swagger.paths[path]
  return (get && get.deprecated !== true) || (post && post.deprecated !== true) || (put && put.deprecated !== true) || (dlt && dlt.deprecated !== true)
})

// tokenize the paths above
const tokenss: string[][] = paths.map(path => split_path(path));

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
  const segment = _.last(split_path(path));
  const pathBody = swagger.paths[path];
  const methods = actions.get(segment) || []; // get, post, put, delete, list
  for (let method of Object.keys(pathBody)) {
    if (!_.includes(['get', 'post', 'put', 'delete'], method)) {
      continue;
    }
    const methodBody = pathBody[method];
    if (methodBody.deprecated === true || methodBody['x-access-level'] === 'Internal') {
      continue;
    }
    if (method == 'get') {
      if (path == '/restapi') {
        method = 'list';
      }
      const schema = methodBody.responses.default.schema;
      if (isListType(schema, swagger.definitions)) {
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
      const bodyParameter = parameters.find((item) => item.in == 'body');
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
  bodyType: string;   // Type of the request body
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
    if (!_.includes(['get', 'post', 'put', 'delete'], method)) {
      continue;
    }
    const methodBody = pathBody[method];
    if (methodBody.deprecated === true || methodBody['x-access-level'] === 'Internal') {
      continue;
    }
    if (method == 'get' && isListType(methodBody.responses.default.schema, swagger.definitions)) {
      method = 'list';
    }
    if (_.find(methods, m => m.method == method)) {
      // console.warn(`Operation already defined for ${method} ${segment}`);
      continue; // already have this method, such as get account/phone-number and get extension/phone-number
    }
    const description = methodBody.description;

    const definitions = {};
    let bodyType: string;
    let queryType: string;
    let parameters: Array<any> = methodBody.parameters;
    if (parameters != undefined) {
      // request body
      const bodyParameter = parameters.find((item) => item.in == 'body');
      if (bodyParameter) {
        if (bodyParameter.schema['$ref']) {
          bodyType = PascalCase(_.last((bodyParameter.schema['$ref']).split('/')));
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
        responseType = PascalCase(responseSchema['$ref'].split('/').pop());
      } else {
        definitions[responseType] = responseSchema;
      }
    }

    methods.push({ method, description, bodyType, queryType, responseType, definitions });
  }
  operations.set(segment, methods);
}

export { swagger, segments, children, segmentIds, actions, Operation, operations };
