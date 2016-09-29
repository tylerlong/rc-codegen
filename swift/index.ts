import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import * as _ from 'lodash';
import { swagger, segments, actions, segmentIds, children } from '../common/swagger';
import { format_code, PascalCase } from '../common/util';


// template engine
const engine = nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
});
const http_method = (str: string): string => {
  if (str == 'list') {
    return 'get';
  }
  if (_.includes(['get', 'post', 'put', 'delete'], str)) {
    return str;
  }
  throw new RangeError(`Unknown http method: "${str}"`);
}
engine.addFilter('http_method', http_method);

// convert swagger type to swift type
const get_type = (type, format, ref, items) => {
  if (!type) {
    return _.last<string>(ref.split('/')).replace(/\./g, '_');
  }
  if (type === 'string') {
    if (format === 'binary') {
      return 'Data';
    }
    return 'String';
  }
  if (type === 'boolean') {
    return 'Bool';
  }
  if (type === 'integer') {
    return 'Int';
  }
  if (type === 'array') {
    return '[' + _.upperFirst(_.last<string>((items.type || items.$ref).split('/')).replace(/\./g, '_')) + ']';
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

// render Definitions.swift
const render_definitions = (output: string) => {
  const definitions = generate_definitions(swagger.definitions);
  for (const definition of definitions) {
    definition['with_import'] = true
    const code = engine.render('Definition.swift', { definition });
    fs.writeFileSync(path.join(output, 'Definitions', `${definition.name}.swift`), format_code(code));
  }
}

// render paths swift files
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
    const code = engine.render('Path.swift', { segment, className, methods, myChildren });
    fs.writeFileSync(path.join(output, 'Paths', `${className}.swift`), format_code(code));
  }
}

// the only method to export
const generate = (output: string) => {
  render_definitions(output);
  render_paths(output);
}


export { generate };
