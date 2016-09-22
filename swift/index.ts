import * as fs from 'fs';
import * as path from 'path';
import { swagger } from '../common/swagger';


const generate = (output: string) => {
  const temp = 'hello world';
  for (const key of Object.keys(swagger.definitions)) {
    console.log(key);
    // generate definition
    break;
  }
  fs.writeFileSync(path.join(output, 'Definitions.swift'), temp);
}


export { generate };
