import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import { swagger } from '../common/swagger';


const engine = nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
});

const generate = (output: string) => {
  const definitions = Object.keys(swagger.definitions).map((key) => {
    const name = key.replace(/\./g, '_');
    const properties = swagger.definitions[key].properties;
    const fields = Object.keys(properties).map((name) => {
      const { type, description } = properties[name];
      return { name, type, description };
    });
    return { name, fields };
  });
  const code = engine.render('Definitions.swift', { definitions });
  fs.writeFileSync(path.join(output, 'Definitions.swift'), code);
}


export { generate };
