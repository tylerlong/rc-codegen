import * as commander from 'commander';
import * as _ from 'lodash';
import * as fs from 'fs';
import { segments, routes, hasIds } from './swagger';


const languages = ['swift']
commander.version('1.0.0')
  .option('-l --language [language]', 'programming languages: ' + languages.join(', '))
  .option('-o --output [output]', 'output directory')
  .parse(process.argv);
if(!commander.language || !commander.output
  || !_.includes(languages, commander.language)
  || !fs.lstatSync(commander.output).isDirectory()) {
  commander.help();
}


console.log('hello world');
