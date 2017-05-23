import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import * as _ from 'lodash';
import { swagger, segments, actions, segmentIds, children } from '../common/swagger';
import { format_code, PascalCase } from '../common/util';

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
    let code = engine.render('Definition.njk', { definition, withPackage: true });
    code = format_code(code);
    fs.writeFileSync(path.join(output, 'definitions', `${definition.name}.java`), code);
  }
}

// render Paths Java files
const render_paths = (output: string) => {
  for (const segment of segments) {
    const className = PascalCase(segment);
    const methods = (actions.get(segment) || []).map((method) => {
      method.definitions = generate_definitions(method.definitions);
      return method;
    });
    const myChildren = Array.from(children.get(segment)).map((child) => {
      return { camelCase: _.camelCase(child), PascalCase: PascalCase(child), hasId: segmentIds.get(child) };
    });
    const code = engine.render('Path.njk', { segment, className, methods, myChildren });
    fs.writeFileSync(path.join(output, 'paths', `${className}.java`), format_code(code));
  }
}

// the only method to export
const generate = (output: string, templates: string) => {
  initEngine(templates)
  render_definitions(output);
  render_paths(output);
}


export { generate };
