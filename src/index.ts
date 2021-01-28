#!/usr/bin/env node
import { Program } from './program'

// entrypoint
new Program(process.argv).Run();