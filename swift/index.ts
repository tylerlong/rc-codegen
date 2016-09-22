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
  const code = engine.render('Definitions.swift', {
    definitions: [
      { name: 'AccountInfo' },
      { name: "ExtensionInfo" }
    ]
  });
  fs.writeFileSync(path.join(output, 'Definitions.swift'), code);
}


export { generate };
