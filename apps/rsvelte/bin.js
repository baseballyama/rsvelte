#!/usr/bin/env node
// The `rsvelte` command, run inside this process by the addon. It never touches process.stdout,
// so that Node.js leaves the terminal's descriptors blocking for the command's writes.
import binding, { directory } from './binding.js';

process.exitCode = binding.run(process.argv.slice(2), directory);
