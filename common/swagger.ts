import * as fs from 'fs';
import * as path from 'path';


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


export { swagger, segments, routes, hasIds };
