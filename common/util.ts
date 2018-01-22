import * as _ from 'lodash';


// format code, indent code properly
const format_code = (str: string): string => {
  let indent = 0;
  let result = '';
  for (const line of str.replace(/\s+$/mg, '').replace(/\n{2,}/g, '\n').split('\n').map(item => item.trim())) {
    if (line == '}') {
      indent -= 4;
    }
    result += _.repeat(' ', indent) + line + '\n';
    if (line.endsWith('{') || line.endsWith(' in')) {
      indent += 4;
    }
  }
  return result;
}

// convert string to PascalCase
const PascalCase = (str: string): string => {
  return _.upperFirst(_.camelCase(str));
}

/**
 * Test if response is a list
 */
const isListType = (schema, definitions): boolean => {
  if (!schema) {
    return false;
  }
  // "$ref": "#/definitions/ExtensionCallLogResponse"
  if (schema.$ref && definitions) {
    return isListType(definitions[_.last(schema.$ref.split('/'))], definitions)
  }
  var props = schema.properties;
  if (schema.type == "object" && props && props.records && props.records.type === 'array') {
    return true;// "PageResult";
  }
}

const isLegalIdentifier = (name: string) => {
  return /^[a-zA-Z_]\w*$/.test(name);
}

export { format_code, PascalCase, isListType, isLegalIdentifier };
