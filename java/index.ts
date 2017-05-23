import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import * as _ from 'lodash';
import { swagger } from '../common/swagger';
import { format_code } from '../common/util';

// template engine
let engine = null
const initEngine = (templates) => {
  engine = nunjucks.configure(templates, {
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true,
  });
}

// convert swagger type to Java type
const get_type = (type, format, ref, items) => {
  if (!type) {
    return _.last<string>(ref.split('/')).replace(/\./g, '_');
  }
  if (type === 'string') {
    return 'String';
  }
  if (type === 'boolean') {
    return 'Boolean';
  }
  if (type === 'integer') {
    return 'Long';
  }
  if (type === 'array') {
    let type = _.last<string>((items.type || items.$ref).split('/')).replace(/\./g, '_');
    type = _.upperFirst(type);
    return type + '[]';
  }
  throw new RangeError(`Unknown field type: "${type}"`);
}

// convert swagger definitions to nunjucks definitions
const generate_definitions = (definitions) => {
  return Object.keys(definitions).map((key) => {
    const name = key.replace(/\./g, '_');
    const properties = definitions[key].properties;
    const fields = Object.keys(properties).map((name) => {
      const { type, format, description, $ref, items } = properties[name];
      return { name, type: get_type(type, format, $ref, items), description };
    });
    return { name, fields };
  });
}

// render Definitions.cs
const render_definitions = (output: string) => {
  const definitions = generate_definitions(swagger.definitions);
  for (const definition of definitions) {
    let code = engine.render('Definition.njk', { definition });
    code = format_code(code);
    fs.writeFileSync(path.join(output, 'definitions', `${definition.name}.java`), code);
  }
}

// the only method to export
const generate = (output: string, templates: string) => {
  initEngine(templates)
  render_definitions(output);
  // render_paths(output);
}


export { generate };
