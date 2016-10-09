import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {compile, configure} from 'nunjucks';
import * as _ from 'lodash';
import { swagger } from '../common/swagger';
import Definition from './Definition';



function renderDefinions(keyedDefinitions, tpl: nunjucks.Template, outDir: string) {
    for (let name in keyedDefinitions) {
        let defData = new Definition(keyedDefinitions[name], name);
        let defSource = tpl.render(defData);
        writeFileSync(outDir + '/' + defData.name + '.ts', defSource);
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
}

export {generate}