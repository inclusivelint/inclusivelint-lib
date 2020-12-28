#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import * as path from 'path';
import { InclusiveDiagnostic, scanFile } from './scanner'
const { Command } = require('commander');

function prettyPrintResults(diagnostics: InclusiveDiagnostic[]) {
  for (let diagnostic of diagnostics) {
    console.log(
      chalk.yellow(createMessage(diagnostic))
    );
  }
}

function createMessage(diagnostic: InclusiveDiagnostic): String {
  return `[Warning] Line ${ diagnostic.lineNumber } : The term ${ diagnostic.term } was found. Consider using ${ diagnostic.suggestedTerms }`;
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
  .option('--scan <filePath>', 'file path')
  .parse(process.argv);

if (program.scan) {
    const runDiagnostics = async () => {
        var filePath: string = path.join(process.cwd(), program.scan);
        var diagnostics: InclusiveDiagnostic[] = await scanFile(filePath)
        prettyPrintResults(diagnostics);
    };

    runDiagnostics();
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
