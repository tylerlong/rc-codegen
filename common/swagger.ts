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

// each segment and their children
const routes = new Map<string, Set<string>>();
for (const segment of segments) {
  routes.set(segment, new Set<string>());
}
for (const tokens of tokenss) {
  for (let i = 1; i < tokens.length; i++) {
    routes.get(tokens[i - 1]).add(tokens[i]);
  }
}

// whether a segment could have an ID
const hasIds = new Map<string, boolean>();
const pathsStr = paths.join('\n');
for (const segment of segments) {
  const hasIdRegex = new RegExp(`/${segment}/(?:\{[^{}/]+\}|v1\.0)(?:/|$)`, 'm');
  hasIds.set(segment, hasIdRegex.test(pathsStr));
}

// actions
const actions = new Map<string, any[]>();
for (const path of paths) {
  const segment = _.last(path.split('/').filter(token => /^[a-z-]+$/i.test(token)));
  const pathBody = swagger.paths[path];
  const methods = []; // get, post, put, delete
  for (const method of Object.keys(pathBody)) {
    if (method == 'parameters') {
      continue;
    }
    const methodBody = pathBody[method];
    const description = methodBody.description;
    const definitions = {};
    const responseBody = methodBody.responses.default.schema;
    let responseName = `${_.upperFirst(method)}Response`
    if (responseBody === undefined) {
      responseName = '' // no response body
    } else {
      if (responseBody['$ref'] === undefined) {
        if(responseBody.type == 'string' && responseBody.format == 'binary') {
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


export { swagger, segments, routes, hasIds, actions };
