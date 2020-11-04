import * as https from "https"
import * as config from './config.json';

export class RetextParser {
  private static dictionary: { [id: string]: string; } = null;

  /**
   * Downloads a file a returns its string content through a Promise
   * @param url file Url
   * @returns file content Promise
   */
  private static async downloadFile(url: string): Promise<string> {

    // returning the promise
    return await new Promise((resolve, reject) => {

      // trying to download the file
      https.get(
        url,
        function (response) {

          const { statusCode } = response;
          if (statusCode >= 300) {
            console.error('Unable to download file, check your connectivity. File Url: ' + url + '. Error details: ' + response.statusMessage)
            reject(new Error(response.statusMessage))
          }

          // building the return string by combining the chunks
          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));

          // returning the promise when the call finishes
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
      result = result.replace(/\([^\)]+\)/g, '');
    }

    return result.trim();
  }

  /**
   * Fetches and parses non-inclusive terms.
   * @returns dictionary containing the term and not-ok terms related to it
   */
  public static async getTerms(): Promise<{ [id: string]: string; }> {

    // returning a promise
    return await new Promise((resolve, reject) => {

      // if dictionary was already baked, just return it
      if (this.dictionary != null) {
        resolve(this.dictionary);
        return;
      }

      (async function () {
        // downloads the file
        let fileContent: string = await RetextParser.downloadFile(config.DictionaryUrl);

        // parses lines and initializes dictionary
        var lines = fileContent.split('\n');
        var dictionary: { [id: string]: string; } = {};

        //iterate through lines
        for (let i = 2; i < lines.length; i++) {

          // finds and sanitizes the key term and not-ok terms
          var values = lines[i].split('|');
          var key: string = RetextParser.sanitizeValue(values[3], true).toLowerCase();
          let value: string = RetextParser.sanitizeValue(values[4], false);

          // a term may have more than one definition
          // if that is the case, we expand it for each term
          if (key.indexOf(',') == -1) {
            dictionary[key] = value;
          } else {
            var keys = key.split(',');
            keys.forEach(subKey => {
              dictionary[subKey.trim()] = value;
            })
          }

        }

        // deliver the promise
        RetextParser.dictionary = dictionary;
        resolve(dictionary);

      })();

    });

  }
}
