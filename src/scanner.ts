import { readFileSync } from 'fs';
import { RetextParser } from './retext-parser'

export interface InclusiveDiagnostic {
    lineNumber: number;
    term: string;
    termStartIndex: number;
    termEndIndex: number;
    termLineStartIndex: number;
    termLineEndIndex: number;
    suggestedTerms: string;
}

/**
 * Scan a file in search of non-inclusive terms
 * Complexity: O(N*M)
 * where: N = number of words
 *        M = number of non-inclusive terms to be scanned
 * @param filePath path for the file
 * @returns a list of InclusiveDiagnostic results
 */
export async function scanFile(filePath: string): Promise<InclusiveDiagnostic[]> {
    // read entire file is faster than going through lines
    let fileContent: string = readFileSync(filePath, 'utf8');

    return await scan(fileContent);
}

/**
 * Scan a file in search of non-inclusive terms
 * Complexity: O(N*M)
 * where: N = number of words
 *        M = number of non-inclusive terms to be scanned
 * @param filePath path for the file
 * @returns a list of InclusiveDiagnostic results
 */
export async function scan(fileContent: string): Promise<InclusiveDiagnostic[]> {
    var diagnostics: InclusiveDiagnostic[] = [];
    const lineBreak:string = '\n'

    // reads the terms
    var terms: { [id: string]: string; } = await RetextParser.getTerms();

    // iterate terms: less costly than iterating lines or words
    for (let term in terms) {
        // build regex expression and initializes indexes
        const regex = new RegExp('\\b(' + term + ')\\b', "gi")

        // quickly search for the term and dismisses it if no occurrence is found
        if (!regex.test(fileContent)) {
            continue;
        }

        // termIndex is the overall term index on the file, offsetIndex is the relative index after the last word occurrence
        let termIndex: number = -1;
        let offsetIndex: number = -1;

        // look for term occurrences until there is nothing left (when offsetIndex is -1)
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

                // create and send the diagnostic object
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