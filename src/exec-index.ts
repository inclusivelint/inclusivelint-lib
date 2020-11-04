import { InclusiveDiagnostic, scanFile } from './scanner'

const runDiagnostics = async () => {
    var diagnostics: InclusiveDiagnostic[] = await scanFile("<file path>")
    console.log(JSON.stringify(diagnostics));
};

runDiagnostics();