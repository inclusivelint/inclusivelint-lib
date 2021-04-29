import * as https from "https"

export class RetextParser {
    private static dictionary: { [id: string]: string; } = {};
    private static isDictionaryFilled = false;

    /**
     * Downloads a file a returns its string content through a Promise
     * @param url file Url
     * @returns file content Promise
     */
    private static async downloadFile(url: string): Promise<string> {
        return await new Promise((resolve, reject) => {

            https.get(
                url,
                function (response) {

                    if (response.statusCode == undefined || response.statusCode >= 300) {
                        console.error('Unable to download file, check your connectivity. File Url: ' + url + '. Error details: ' + response.statusMessage)
                        reject(new Error(response.statusMessage))
                    }

                    const chunks: any = [];
                    response.on('data', (chunk) => chunks.push(chunk));

                    response.on('end', () => resolve(Buffer.concat(chunks).toString()));

                }
            ).end();
        })
    }

    /**
     * Sanitizes a value by trimming, removing grave accents and parenthesis.
     * @param value original value
     * @param removeParenthesis indicates whether to remove parenthesis or not
     * @returns value copy without the aforementioned characters
     */
    private static sanitizeValue(value: string, removeParenthesis: boolean): string {
        let result: string = value.replace(/[`]/g, "");
        if (removeParenthesis) {
            result = result.replace(/\([^)]+\)/g, '');
        }

        return result.trim();
    }

    /**
     * Fetches and parses non-inclusive terms.
     * @returns dictionary containing the term and not-ok terms related to it
     */
    public static async getTerms(dictionaryUrl: string): Promise<{ [id: string]: string; }> {

        // returning a promise
        return await new Promise((resolve, reject) => {

            // if dictionary was already baked, just return it
            if (RetextParser.isDictionaryFilled) {
                resolve(this.dictionary);
                return;
            }

            (async function () {
                let fileContent: string;
                try {
                    fileContent = await RetextParser.downloadFile(dictionaryUrl);
                } catch (e) {
                    reject('Error fetching terms file: ' + e)
                    return;
                }

                const lines = fileContent.split('\n');
                const dictionary: { [id: string]: string; } = {};

                for (let i = 2; i < lines.length; i++) {

                    // finds and sanitizes the key term and not-ok terms
                    const values = lines[i].split('|');
                    const key: string = RetextParser.sanitizeValue(values[3], true).toLowerCase();
                    let value: string = RetextParser.sanitizeValue(values[4], false);

                    // a term may have more than one definition
                    // if that is the case, we expand it for each term
                    if (key.indexOf(',') == -1) {
                        dictionary[key] = value;
                    } else {
                        const keys = key.split(',');
                        keys.forEach(subKey => {
                            dictionary[subKey.trim()] = value;
                        })
                    }

                }

                RetextParser.dictionary = dictionary;
                RetextParser.isDictionaryFilled = true;
                resolve(dictionary);
            })();
        });
    }
}
