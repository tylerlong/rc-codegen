import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import * as _ from 'lodash';
import { swagger, segments, actions, segmentIds, children } from '../common/swagger';
import { format_code, PascalCase } from '../common/util';


// template engine
let engine = null
const initEngine = (templates: string) => {
  engine = nunjucks.configure(templates, {
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true,
  });
}


const renderPaths = () => {
  let obj = {}
  for (let [k, v] of children) {
    obj[k] = Array.from(v);
  }
  const code = engine.render('paths.njk', { segments: Array.from(segments), children: obj, hasIds: segmentIds });

  // const temp = Array.from(segments)
  // temp.forEach(item => {
  //   console.log(item)
  //   console.log(children.get(item))
  // })

  console.log(code)
}


// the only method to export
const generate = (output: string, templates: string) => {
  initEngine(templates)
  renderPaths()
}


export { generate };
