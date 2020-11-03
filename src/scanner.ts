import { createReadStream, ReadStream } from 'fs';
import { createInterface, Interface } from 'readline'

export interface InclusiveDiagnostic {
    lineNumber: number;
    term: string;
    termStartIndex: number;
    termEndIndex: number;
    suggestedTerms: string;
}

const mockedTerms: { [id: string]: string; } = {
    "slave": "primary, primaries, hub, hubs, reference, references, replica, replicas, spoke, spokes, secondary, secondaries",
    "sophisticated culture" : "complex culture"
};

// Complexity: O(N*M*P)
// where: N = number of lines in a file;
//        M = number of non-inclusive terms to be scanned
//        P = number of words in a line
export async function scanNonInclusiveTerms(filePath: string): Promise<InclusiveDiagnostic[]> {
    var fileReadStream : ReadStream = createReadStream(filePath);

    var reader: Interface = createInterface({
        input: fileReadStream,
        crlfDelay: Infinity
    })

    var diagnostics: InclusiveDiagnostic[] = [];
    var lineIndex: number = 0;

    for await (const line of reader) {
        lineIndex++;
        
        for (let originalTerm in mockedTerms) {
            if (!line.includes(originalTerm))
                continue;
            
            let originalTermIndex = line.indexOf(originalTerm);

            let diagnostic: InclusiveDiagnostic = {
                lineNumber: lineIndex,
                term: originalTerm,
                termStartIndex: originalTermIndex,
                termEndIndex: originalTermIndex + originalTerm.length - 1,
                suggestedTerms: mockedTerms[originalTerm]
            };

            diagnostics.push(diagnostic);
        }
    }

    return diagnostics;
}
