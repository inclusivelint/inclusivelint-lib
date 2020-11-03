import { InclusiveDiagnostic, scanNonInclusiveTerms } from './scanner'

const runDiagnostics = async () => {
    var diagnostics: InclusiveDiagnostic[] = await scanNonInclusiveTerms("<file path>")
    console.log(JSON.stringify(diagnostics));
};

runDiagnostics();
