import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { compile, configure } from 'nunjucks';
import * as _ from 'lodash';
import { swagger, segments, actions } from '../common/swagger';
import Definition from './Definition';
import UrlSegment from './paths';
import genUrlSegments from './gen-segments';
import genOperations from './gen-operations';

function renderSegments(tpl: nunjucks.Template, outDir: string) {
  let urlSegments = genUrlSegments(Object.keys(swagger.paths), swagger.parameters);
  genOperations(urlSegments);
  for (let k in urlSegments) {
    let cls = urlSegments[k];
    let file = outDir + '/paths/' + cls.name + '.ts';
    writeFileSync(file, tpl.render(cls));
  }
}

function renderDefinions(keyedDefinitions, tpl: nunjucks.Template, outDir: string) {
  for (let name in keyedDefinitions) {
    let defData = new Definition(keyedDefinitions[name], name);
    let defSource = tpl.render(defData);
    writeFileSync(outDir + '/definitions/' + defData.name + '.ts', defSource);
  }
}

function generate(outDir: string) {
  let tplDir = join(__dirname, 'views');
  let env = configure({
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true
  });

  let definitionTpl = compile(readFileSync(join(tplDir, 'Definition.njk')).toString("utf8"), env);
  renderDefinions(swagger.definitions, definitionTpl, outDir);

  let segmentTpl = compile(readFileSync(join(tplDir, 'Paths.njk')).toString('utf8'), env);
  renderSegments(segmentTpl, outDir);
}

export { generate }
