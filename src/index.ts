import { InclusiveDiagnostic, scanNonInclusiveTerms } from './scanner'
import { RetextParser } from './retext-parser'

const runDiagnostics = async () => {
    var diagnostics: InclusiveDiagnostic[] = await scanNonInclusiveTerms("<file name>")
    console.log(JSON.stringify(diagnostics));
};

runDiagnostics();
