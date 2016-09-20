import * as fs from 'fs';


const swagger: any = JSON.parse(fs.readFileSync('swagger.json', 'utf-8'));

const paths: string[] = Object.keys(swagger.paths);

// tokenize the paths above
const tokenss: string[][] = paths.map(path => path.split('/').filter(token => /^[a-z-]+$/i.test(token)));

// flatten the array above
const tokens: string[] = [].concat.apply([], tokenss);

// remove duplicates
const segments = new Set<string>(tokens);

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

export { segments, routes };
