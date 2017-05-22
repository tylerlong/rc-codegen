import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import * as _ from 'lodash';
import { segments, actions, segmentIds, children } from '../common/swagger';
import { PascalCase } from '../common/util';


// template engine
let engine = null
const initEngine = (templates: string) => {
  engine = nunjucks.configure(templates, {
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true,
  });
  engine.addFilter('PascalCase', PascalCase);
  engine.addFilter('camelCase', camelCase);
}
const camelCase = (str) => {
  return _.camelCase(str)
}


const renderPaths = (output: string) => {
  let obj = {}
  for (let [k, v] of children) {
    obj[k] = Array.from(v);
  }
  const code = engine.render('paths.njk', { segments: Array.from(segments), children: obj, hasIds: segmentIds, methods: actions });
  fs.writeFileSync(path.join(output, `paths.rb`), code);
}


// the only method to export
const generate = (output: string, templates: string) => {
  initEngine(templates)
  renderPaths(output)
}


export { generate };
