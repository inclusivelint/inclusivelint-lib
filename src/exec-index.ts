#!/usr/bin/env node

import { InclusiveDiagnostic, scanFile } from './scanner'

const runDiagnostics = async () => {
    var diagnostics: InclusiveDiagnostic[] = await scanFile("/media/edguer/Data/edguer/Documents/Projects/inclusivelint/test/pom.xml")
    console.log(JSON.stringify(diagnostics));
};

runDiagnostics();