import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import * as _ from 'lodash';
import { swagger, segments, actions, segmentIds, children } from '../common/swagger';
import { format_code, PascalCase } from '../common/util';


// template engine
const engine = nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
});
const http_method = (str: string): string => {
  if (str == 'list') {
    return 'get';
  }
  if (_.includes(['get', 'post', 'put', 'delete'], str)) {
    return str;
  }
  throw new RangeError(`Unknown http method: "${str}"`);
}
engine.addFilter('http_method', http_method);


const render_definitions = (output: string) => {
  console.log(`render_definitions to ${output}`);
}


const render_paths = (output: string) => {
  console.log(`render_paths to ${output}`);
}


// the only method to export
const generate = (output: string) => {
  render_definitions(output);
  render_paths(output);
}


export { generate };
