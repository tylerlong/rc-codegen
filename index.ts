import * as commander from 'commander';
import * as _ from 'lodash';
import * as fs from 'fs';


const languages = ['swift']
commander.version(require('./package.json').version)
  .option('-l --language [language]', 'programming languages: ' + languages.join(', '))
  .option('-o --output [output]', 'output directory')
  .parse(process.argv);
if(!commander.language || !commander.output
  || !_.includes(languages, commander.language)
  || !fs.lstatSync(commander.output).isDirectory()) {
  commander.help();
}


require(`./${commander.language}/index`).generate(commander.output);
