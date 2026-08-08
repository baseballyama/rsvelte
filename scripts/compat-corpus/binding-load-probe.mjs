// Loads a staged NAPI binding and compiles one component. Runs as its own
// process because an invalid binding is killed by the kernel, which would take
// the caller down with it rather than returning an error.
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
// Resolve first: require() reads a bare relative path as a module specifier.
const binding = require(path.resolve(process.argv[2]));
const out = binding.compile('<p>{1}</p>', { generate: 'client', dev: false, filename: 'C.svelte' });
if (!out?.js?.code) {
	console.error('binding loaded but produced no js output');
	process.exit(1);
}
