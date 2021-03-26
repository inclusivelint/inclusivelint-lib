import { readFileSync } from 'fs';
import { RetextParser } from './retext-parser'

/**
 * Interface representing inclusive diagnostic data.
 */
export interface InclusiveDiagnostic {
    /**
     * Line number in which the diagnostic is pointing to.
     */
    lineNumber: number;
    /**
     * Term found by the linter.
     */
    term: string;
    /**
     * Occurrence start index related to the whole file - line breaks are considered as common characters.
     */
    termStartIndex: number;
    /**
     * Occurrence end index related to the whole file - line breaks are considered as common characters.
     */
    termEndIndex: number;
    /**
     * Occurrence start index of the corresponding line.
     */
    termLineStartIndex: number;
    /**
     * Occurrence end index of the corresponding line.
     */
    termLineEndIndex: number;
    /**
     * Suggested terms to be used.
     */
    suggestedTerms: string;
}

/**
 * File representation class. We are avoiding passing variables through functions to avoid unnecessary memory copies.
 */
// class FileInfo {
//     public fileUri: string;
//     public fileContent: string = "";

//     /**
//      * Default constructor.
//      * @param fileUrl file Uri
//      * @param fileContent file content as string
//      */
//     constructor(fileUri:string) {
//         this.fileUri = fileUri;
//     }
// }

/**
 * Scan a file in search of non-inclusive terms
 * @param dictionaryUrl url for the dictionary
 * @param filePath path for the file
 * @returns a list of InclusiveDiagnostic results
 */
export async function scanFile(dictionaryUrl: string, filePath: string): Promise<InclusiveDiagnostic[]> {
    var fileContent = readFileSync(filePath, 'utf8');

    return await scan(dictionaryUrl, fileContent);
}

/**
 * Method that scan string content in search of non-inclusive terms
 * @param dictionaryUrl url for the dictionary
 * @param fileContent string containing all the text to be analyzed
 * @returns a list of InclusiveDiagnostic results
 */
export async function scan(dictionaryUrl: string, fileContent: string): Promise<InclusiveDiagnostic[]> {
    var diagnostics: InclusiveDiagnostic[] = [];
    const lineBreak:string = '\n'

    var terms: { [id: string]: string; } = await RetextParser.getTerms(dictionaryUrl);

    for (let term in terms) {
        const regex = new RegExp('\\b(' + term + ')\\b', "gi")

        if (!regex.test(fileContent)) {
            continue;
        }

        // termIndex is the overall term index on the file, offsetIndex is the relative index after the last word occurrence
        let termIndex: number = -1;
        let offsetIndex: number = -1;

        do {
            offsetIndex = fileContent.substring(termIndex >= 0 ? termIndex + 1 : 0).search(regex);

            // only do processing when a word is found
            if (offsetIndex > -1) {
                // keep the term index updated with the overall index
                termIndex += offsetIndex + 1;

                // calculates line indexes
                // gets the absolute last line break character in the file just before the term
                let lastLineBreakIndex: number = fileContent.substring(0, termIndex).lastIndexOf(lineBreak);
                // gets the next line break after the term - now we know where the line starts and ends
                let nextLineBreakIndex: number = fileContent.substring(termIndex).indexOf(lineBreak) + termIndex;
                // tabs are equivalent to 4 characters by default, so we must count them
                let tabsInLine: number = (fileContent.substring(lastLineBreakIndex, nextLineBreakIndex).match(/\t/g) || []).length;
                /**
                 * calculating the start index of the term in the line:
                 * 1) termIndex - lastLineBreakIndex -> will give the relative position of the term to the line
                 * 2) tabsInLine * 3 -> each tab is counted as one character in 1). As we want 1 tab to be equivalent to 4 characters
                 *    we must add 3 to each tab to the overall count
                 */
                let termLineStartIndex = termIndex - lastLineBreakIndex + (tabsInLine * 3);

                diagnostics.push({
                    lineNumber: (fileContent.substring(0, termIndex).match(/\n|\n\r|\r/g) || []).length + 1,
                    term: term,
                    termStartIndex: termIndex,
                    termEndIndex: termIndex + term.length - 1,
                    termLineStartIndex: termLineStartIndex,
                    termLineEndIndex: termLineStartIndex + term.length,
                    suggestedTerms: terms[term]
                });
            }
        } while (offsetIndex > -1);
    }

    return diagnostics;
}
