import { createReadStream, ReadStream } from 'fs';
import { createInterface, Interface } from 'readline'

const mockedTerms: { [id: string]: string; } = {
    "slave": "primary, primaries, hub, hubs, reference, references, replica, replicas, spoke, spokes, secondary, secondaries",
    "sophisticated culture" : "complex culture"
};

// Complexity: O(N*M*P)
// where:
//  N = number of lines in a file;
//  M = number of non-inclusive terms to be scanned
//  P = number of words in a line
function getNonInclusiveTerms(filePath: string) {
    var fileReadStream : ReadStream = createReadStream(filePath);
    var reader: Interface = createInterface(fileReadStream)

    reader.on("line", (line: string) => {
        for (let originalTerm in mockedTerms) {
            if (!line.includes(originalTerm))
                continue;
            let suggestedTerms: string = mockedTerms[originalTerm];
            console.log(`The term ${originalTerm} was detected, consider other terms such as '${suggestedTerms}' instead.`)
        }
    })

    reader.on("close", () => {
        console.log(`Data has been read.`);
    })    
}

getNonInclusiveTerms("<file_path>")
