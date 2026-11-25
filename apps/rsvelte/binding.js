// Loads the native addon: the file `RSVELTE_BINDING` names, which the tests build, or else the
// platform package npm installed for this machine.
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

const require = createRequire(import.meta.url);
const path =
	process.env.RSVELTE_BINDING ??
	`@rsvelte/binding-${process.platform}-${process.arch}/rsvelte.node`;
/**
 * @typedef {{ line: number, column: number, character: number }} Position
 * @typedef {{ code: string, message: string, start: Position, end: Position }} Report
 * @typedef {{ code: string, map?: string }} Output
 * @typedef {{ compiled?: { js: Output, css?: Output, warnings: Report[] }, error?: Report }} Outcome
 * @typedef {{ filename?: unknown, generate?: unknown, preserveWhitespace?: unknown }} Options
 * @typedef {{
 *   VERSION: string,
 *   compile(source: string, options: Options): Outcome,
 *   compileModule(source: string, options: Options): Outcome,
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
