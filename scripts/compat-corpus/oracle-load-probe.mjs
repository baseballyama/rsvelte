// Loads the official compiler and compiles one known-good component and one
// known-good module. Runs as its own process for the same reason the binding
// probe does: a broken oracle can die in ways an import guard cannot catch.
import path from 'node:path';

const entry = path.resolve(process.argv[2]);
const svelte = await import(entry);

const component = svelte.compile('<p>{1}</p>', { generate: 'client', dev: false, filename: 'C.svelte' });
if (!component?.js?.code) {
	console.error('official compiler loaded but produced no component output');
	process.exit(1);
}
const module = svelte.compileModule('export const a = 1;', {
	generate: 'server',
	dev: false,
	filename: 'm.svelte.js',
});
if (!module?.js?.code) {
	console.error('official compiler loaded but produced no module output');
	process.exit(1);
}
