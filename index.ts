import * as commander from 'commander';
import * as _ from 'lodash';
import * as fs from 'fs';

const language = commander['language'];
const output = commander['output'];
const templates = commander['templates'];
const configuration = commander['configuration'];

// ask user to enter languange and output
const languages = ['swift', 'csharp', 'typescript', 'ruby'];
commander.version(require('./package.json').version)
  .option('-l, --language <language>', 'programming languages: ' + languages.join(', '))
  .option('-o, --output <output>', 'output directory')
  .option('-t, --templates <templates>', 'templates directory')
  .option('-c, --configuration [configuration]', 'configuration file')
  .parse(process.argv);
if (!language || !output || !templates
  || !_.includes(languages, language)
  || !fs.lstatSync(output).isDirectory()
  || !fs.lstatSync(templates).isDirectory()) {
  commander.help();
}

// do language specific codegen
require(`./${language}/index`).generate(output, templates, configuration);
