#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import * as fs from 'fs';
import { InclusiveDiagnostic, scanFile } from './scanner'
const { Command } = require('commander');
const { glob } = require('glob');

function prettyPrintResults(filePath: String, diagnostics: InclusiveDiagnostic[]) {
  for (let diagnostic of diagnostics) {
    console.log(
      chalk.yellow(createMessage(filePath, diagnostic))
    );
  }
}

function createMessage(filePath: String, diagnostic: InclusiveDiagnostic): String {
  return `[Warning] ${ filePath }: Line ${ diagnostic.lineNumber } : The term ${ diagnostic.term } was found. Consider using ${ diagnostic.suggestedTerms }`;
}

console.log(
  chalk.green(
    figlet.textSync('inclusivelint', { horizontalLayout: 'full' })
  )
);

const program = new Command();

program
  .version('1.0.0')
  .description("inclusivelint CLI for scanning non-inclusive terms")
  .option('-p, --path <path>', 'Path to be scaned. If its a folder, use the -r ou --resursive option')
  .option('-r, --recursive', 'If the --path option is a folder, use this option to run recursively. Not needed if its path is a file')
  .parse(process.argv);

if (program.path) {
    const runDiagnostics = async () => {
        if (program.recursive) {
          var listOfFiles = glob.sync(program.path + '/**/*');
        }
        else {
          var listOfFiles = glob.sync(program.path)
        }

        for (let uniquePath of listOfFiles) {
          if (fs.lstatSync(uniquePath).isFile()) {
            var diagnostics: InclusiveDiagnostic[] = await scanFile(uniquePath)
            prettyPrintResults(uniquePath, diagnostics);
          }
        }
    };

    runDiagnostics();
}
