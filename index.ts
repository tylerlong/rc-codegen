import * as commander from 'commander';
import * as _ from 'lodash';
import * as fs from 'fs';


// ask user to enter languange and output
const languages = ['swift', 'csharp', 'typescript'];
commander.version(require('./package.json').version)
  .option('-l, --language [language]', 'programming languages: ' + languages.join(', '))
  .option('-o, --output [output]', 'output directory')
  .option('-t, --templates [templates]', 'templates directory')
  .option('-c, --configuration [configuration]', 'configuration file')
  .parse(process.argv);
if (!commander.language || !commander.output || !commander.templates
  || !_.includes(languages, commander.language)
  || !fs.lstatSync(commander.output).isDirectory()
  || !fs.lstatSync(commander.templates).isDirectory()) {
  commander.help();
}

// do language specific codegen
require(`./${commander.language}/index`).generate(commander.output, commander.templates, commander.configuration);
