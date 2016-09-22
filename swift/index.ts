import * as fs from 'fs';
import * as path from 'path';
import { swagger } from '../common/swagger';


const generate = (output: string) => {
  let code = `import Foundation
import ObjectMapper
`;
  for (const key of Object.keys(swagger.definitions)) {
    code += `\npublic class ${key.replace(/\./g, '_')}: Mappable {\n\n}\n`
  }
  fs.writeFileSync(path.join(output, 'Definitions.swift'), code);
}


export { generate };
