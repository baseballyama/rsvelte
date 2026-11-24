// Loads the native addon: the file `RSVELTE_BINDING` names, which the tests build, or else the
// platform package npm installed for this machine.
import { createRequire } from 'node:module';

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
 * }} Binding
 */

/** @type {{ exports: Binding }} */
const module = { exports: /** @type {any} */ ({}) };
try {
	process.dlopen(module, process.env.RSVELTE_BINDING ? path : require.resolve(path));
} catch (error) {
	throw new Error(
		`rsvelte: cannot load ${path}: install rsvelte again, with optional dependencies`,
		{
			cause: error,
		},
	);
}

export default module.exports;
