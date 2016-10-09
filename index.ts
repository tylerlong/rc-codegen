import * as commander from 'commander';
import * as _ from 'lodash';
import * as fs from 'fs';


// ask user to enter languange and output
const languages = ['swift', 'csharp', 'typescript'];
commander.version(require('./package.json').version)
  .option('-l --language [language]', 'programming languages: ' + languages.join(', '))
  .option('-o --output [output]', 'output directory')
  .parse(process.argv);
if(!commander.language || !commander.output
  || !_.includes(languages, commander.language)
  || !fs.lstatSync(commander.output).isDirectory()) {
  commander.help();
}

// do language specific codegen
require(`./${commander.language}/index`).generate(commander.output);
