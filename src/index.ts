import { InclusiveDiagnostic, scanNonInclusiveTerms } from './scanner'

const runDiagnostics = async () => {
    var diagnostics: InclusiveDiagnostic[] = await scanNonInclusiveTerms("<file name>")
    console.log(JSON.stringify(diagnostics));
};

runDiagnostics();
