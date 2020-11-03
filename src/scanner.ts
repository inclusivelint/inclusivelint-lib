import { createReadStream, ReadStream } from 'fs';
import { createInterface, Interface } from 'readline'
import { RetextParser } from './retext-parser'

export interface InclusiveDiagnostic {
    lineNumber: number;
    term: string;
    termStartIndex: number;
    termEndIndex: number;
    suggestedTerms: string;
}

// Complexity: O(N*M*P)
// where: N = number of lines in a file;
//        M = number of non-inclusive terms to be scanned
//        P = number of words in a line
export async function scanNonInclusiveTerms(filePath: string): Promise<InclusiveDiagnostic[]> {
    var diagnostics: InclusiveDiagnostic[] = [];
    var retextTerms: { [id: string]: string; } = await RetextParser.getTerms();
    var lineIndex: number = 0;

    var reader: Interface = createInterface({
        input: createReadStream(filePath),
        crlfDelay: Infinity
    })
    
    for await (const line of reader) {
        lineIndex++;
        
        for (let originalTerm in retextTerms) {
            if (!line.includes(originalTerm))
                continue;
            
            let originalTermIndex = line.indexOf(originalTerm);

            let diagnostic: InclusiveDiagnostic = {
                lineNumber: lineIndex,
                term: originalTerm,
                termStartIndex: originalTermIndex,
                termEndIndex: originalTermIndex + originalTerm.length - 1,
                suggestedTerms: retextTerms[originalTerm]
            };

            diagnostics.push(diagnostic);
        }
    }

    return diagnostics;
}
