import chalk from 'chalk';
import figlet from 'figlet';
import * as fs from 'fs';
import { InclusiveDiagnostic, Scanner } from './scanner'

const { Command } = require('commander');
const { glob } = require('glob');

/**
 * Entrypoint program class.
 */
export class Program {
    //#region Fields
    private commandArguments: any;
    //#endregion
    //#region Constructors
    /**
     * Default constructor, sets up welcome sign and command line arguments.
     */
    constructor(args: String[]) {
        this.commandArguments = this.SetupCommandArgs(args);
        this.PrintWelcomeSign();
    }

    //#endregion
    //#region Accessors
    /**
     * Gets the dictionaryUrl argument value.
     */
    private GetDictionaryUrlArgument(): any {
        return this.commandArguments.dictionaryUrl;
    }

    /**
     * Gets the path argument value;
     */
    private GetPathArgument(): any {
        return this.commandArguments.path;
    }

    /**
     * Gets the ignore argument value;
     */
    private GetIgnoreArgument(): any {
        return this.commandArguments.ignore;
    }

    /**
     * Gets the recursive argument value;
     */
    private GetRecursiveArgument(): any {
        return this.commandArguments.recursive;
    }

    //#endregion
    //#region Public
    /**
     * Async program entrypoint
     */
    public async RunAsync() {
        // get files and run diagnostics for each one of them
        var listOfFiles = this.GetFilesList();
        const scanner: Scanner = new Scanner(this.GetDictionaryUrlArgument())

        for (let uniquePath of listOfFiles) {
            if (fs.lstatSync(uniquePath).isFile()) {
                var diagnostics: InclusiveDiagnostic[] = await scanner.scanFile(uniquePath);
                this.PrintDiagnostics(uniquePath, diagnostics);
            }
        }
    }

    /**
     * Program entrypoint
     */
    public Run() {
        (async () => await this.RunAsync())();
    }

    //#endregion
    //#region Private
    /**
     * Prints diagnostic messages.
     * @param filePath file path analyzed.
     * @param diagnostics diagnostic data
     */
    private PrintDiagnostics(filePath: String, diagnostics: InclusiveDiagnostic[]) {
        for (let diagnostic of diagnostics) {
            this.PrintWarningMessage(filePath, diagnostic);
        }
    }

    /**
     * Prints a warning message.
     * @param filePath file path analyzed.
     * @param diagnostic diagnostic data
     * @returns formatted message.
     */
    private PrintWarningMessage(filePath: String, diagnostic: InclusiveDiagnostic) {
        console.log(
            chalk.yellow(`[Warning] ${filePath}: Line ${diagnostic.lineNumber} : The term ${diagnostic.term} was found. Consider using ${diagnostic.suggestedTerms}`)
        );
    }

    /**
     * Gets the list of ignored paths provided on the command line arguments.
     * @returns list of ignored paths.
     */
    private GetIgnoredPaths(): String[] {
        let ret: string[] = [];

        if (this.GetIgnoreArgument()) {
            ret = this.GetIgnoreArgument().split(',');
            for (let i = 0; i < ret.length; i++) {
                ret[i] = this.GetPathArgument() + ret[i];
            }
        }

        return ret;
    }

    /**
     * Gets the list of files, according to the command line arguments.
     * @param program object used for parsing command line arguments.
     * @returns list of files.
     */
    private GetFilesList(): any {
        // if recursive option is flagged, then we must also consider the ignored paths
        if (this.GetRecursiveArgument()) {
            return glob.sync(this.GetPathArgument() + '/**/*', {
                ignore: this.GetIgnoredPaths(),
            });
        } else {
            return glob.sync(this.GetPathArgument())
        }
    }

    /**
     * Prints the beautiful INCLUSIVELINT sign
     */
    private PrintWelcomeSign() {
        console.log(
            chalk.green(
                figlet.textSync('inclusivelint', { horizontalLayout: 'full' })
            )
        );
    }

    /**
     * Setup the list of command args.
     * @returns program object, used for parsing the command line arguments.
     */
    private SetupCommandArgs(args: String[]): any {
        var program = new Command();

        program
            .version('1.0.0')
            .description("inclusivelint CLI for scanning non-inclusive terms")
            .option('-d, --dictionary-url <url>', 'URL to the dictionary. See wordsTable.md for the format', 'https://raw.githubusercontent.com/inclusivelint/inclusivelint/main/parsers/wordsTable.md')
            .option('-p, --path <path>', 'Path to be scanned. If its a folder, use the -r ou --recursive option')
            .option('-r, --recursive', 'If the --path option is a folder, use this option to run recursively. Not needed if its path is a file')
            .option('-i, --ignore <ignore>', 'List of file patterns to be ignored, colon separated. Example: inclusivelint -p . -r -i /node_modules/**,/.git/** is provided, it will search for all files inside ./, except node_modules and .git folders.')
            .parse(args);

        return program;
    }

    //#endregion
}