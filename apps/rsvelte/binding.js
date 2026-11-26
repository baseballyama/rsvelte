// Loads the native addon: the file `RSVELTE_BINDING` names, which the tests build, or else the
// platform package npm installed for this machine.
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

const require = createRequire(import.meta.url);
const path =
	process.env.RSVELTE_BINDING ??
	`@rsvelte/binding-${process.platform}-${process.arch}/rsvelte.node`;
/**
 * @typedef {import('./compiler-api.js').Compiler & {
 *   run(argv: string[], programs: string): number,
 * }} Binding
 */

/** @type {{ exports: Binding }} */
const module = { exports: /** @type {any} */ ({}) };
let file;
try {
	file = process.env.RSVELTE_BINDING ? path : require.resolve(path);
	process.dlopen(module, file);
} catch (error) {
	throw new Error(
		`rsvelte: cannot load ${path}: install rsvelte again, with optional dependencies`,
		{
			cause: error,
		},
	);
}

export default module.exports;

/** The directory of the addon, where a release installs the programs it starts too. */
export const directory = dirname(file);
