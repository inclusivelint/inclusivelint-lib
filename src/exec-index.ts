#!/usr/bin/env node

import { InclusiveDiagnostic, scanFile } from './scanner'

const runDiagnostics = async () => {
    var diagnostics: InclusiveDiagnostic[] = await scanFile("<file>")
    console.log(JSON.stringify(diagnostics));
};

runDiagnostics();