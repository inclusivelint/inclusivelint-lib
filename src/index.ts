#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';
import figlet from 'figlet';
import clear from 'clear';
import * as path from 'path';
import { InclusiveDiagnostic, scanFile } from './scanner'
const { Command } = require('commander');

clear();
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
        var filePath: string = path.join(__dirname, program.scan);
        var diagnostics: InclusiveDiagnostic[] = await scanFile(filePath)
        console.log(JSON.stringify(diagnostics));
    };

    runDiagnostics();
}

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
