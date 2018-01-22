import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { compile, configure } from 'nunjucks';
import * as nunjucks from 'nunjucks';
import { swagger } from '../common/swagger';
import Definition from './Definition';
import genUrlSegments from './gen-segments';
import genOperations from './gen-operations';

function createLegacyParameters(paths) {
  let parameters = {};
  for (let path in paths) {
    for (let operation in paths[path]) {
      let op = paths[path][operation];
      let parametersAr = op.parameters || [];
      for (let p of parametersAr) {
        if (p['in'] === 'path') {
          parameters[p.name] = p;
        }
      }
    }
  }
  return parameters;
}

function renderSegments(tpl: nunjucks.Template, outDir: string, config) {
  let urlSegments = genUrlSegments(Object.keys(swagger.paths), createLegacyParameters(swagger.paths), config);
  genOperations(urlSegments);
  for (let k in urlSegments) {
    let seg = urlSegments[k];
    while (!seg.isValid()) {
      delete urlSegments[k];
      let { parent } = seg;
      if (!parent) {
        break;
      }
      parent.children.splice(parent.children.indexOf(seg), 1)
      seg = parent;
    }
  }
  for (let k in urlSegments) {
    let cls = urlSegments[k];
    let fileName = cls.name;
    if (cls.hasCustomMethods) {
      fileName += "Base";
    }
    let file = outDir + '/paths/' + fileName + '.ts';
    cls.freeze();
    if (cls.isValid()) {
      writeFileSync(file, tpl.render(cls));
    } else {
      console.log('Ignore paths', cls.name)
    }

  }
}

function renderDefinions(keyedDefinitions, tpl: nunjucks.Template, outDir: string) {
  for (let name in keyedDefinitions) {
    let defData = new Definition(keyedDefinitions[name], name);
    let defSource = tpl.render(defData);
    writeFileSync(outDir + '/definitions/' + defData.name + '.ts', defSource);
  }
}

function generate(outDir: string, tplDir: string, configFile: string) {
  let config = JSON.parse(readFileSync(configFile).toString());
  let env = configure({
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true
  });

  let definitionTpl = compile(readFileSync(join(tplDir, 'Definition.njk')).toString("utf8"), env);
  renderDefinions(swagger.definitions, definitionTpl, outDir);

  let segmentTpl = compile(readFileSync(join(tplDir, 'Paths.njk')).toString('utf8'), env);
  renderSegments(segmentTpl, outDir, config);
}

export { generate }
