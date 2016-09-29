import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';


// read swagger definition
const swagger: any = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf-8'));

// all the paths defined in swagger
const paths: string[] = Object.keys(swagger.paths);

// tokenize the paths above
const tokenss: string[][] = paths.map(path => path.split('/').filter(token => /^[a-z-]+$/i.test(token)));

// flatten the array above and remove duplicates
const segments = new Set<string>([].concat.apply([], tokenss));

// whether a segment could have an ID
const hasIds = new Map<string, boolean>();
const pathsStr = paths.join('\n');
for (const segment of segments) {
  const hasIdRegex = new RegExp(`/${segment}/(?:\{[^{}/]+\}|v1\.0)(?:/|$)`, 'm');
  hasIds.set(segment, hasIdRegex.test(pathsStr));
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
      const properties = methodBody.responses.default.schema.properties;
      if (properties != undefined && properties.navigation != undefined) {
        method = 'list';
      }
    }
    if (_.find(methods, function (m) { return m.method == method; })) {
      continue; // already have this method, such as get account/phone-number and get extension/phone-number
    }
    const description = methodBody.description;
    const definitions = {};
    const responseBody = methodBody.responses.default.schema;
    let responseName = `${_.upperFirst(method)}Response`
    if (responseBody === undefined) {
      responseName = '' // no response body
    } else {
      if (responseBody['$ref'] === undefined) {
        if (responseBody.type == 'string' && responseBody.format == 'binary') {
          responseName = '@Binary'; // special return type
        } else {
          definitions[responseName] = responseBody; // just like an entry in swagger definitions
        }
      } else {
        responseName = _.last((responseBody['$ref'] as string).split('/'));
      }
    }
    methods.push({ method, description, definitions, responseName });
  }
  actions.set(segment, methods);
}


export { swagger, segments, children, hasIds, actions };
