// The official svelte/compiler API over a binding of rsvelte's compiler, the Node.js addon or the
// WebAssembly module. An option this compiler does not take, or takes only at its default, throws
// instead of being ignored.
import { sourceMap } from './source-map.js';

/**
 * What a binding returns and takes.
 * @typedef {{ line: number, column: number, character: number }} Position
 * @typedef {{ code: string, message: string, start: Position, end: Position }} Report
 * @typedef {{ code: string, map?: string }} Output
 * @typedef {{ compiled?: { js: Output, css?: Output | null, warnings: Report[] }, error?: Report }} Outcome
 * @typedef {{ filename?: unknown, generate?: unknown, preserveWhitespace?: unknown }} Options
 * @typedef {{
 *   VERSION: string,
 *   compile(source: string, options: Options): Outcome,
 *   compileModule(source: string, options: Options): Outcome,
 * }} Compiler
 */

/**
 * Options the official compiler takes that do not change this compiler's output at these values.
 * `runes: true` is the default too: runes mode is the only mode.
 * @type {Record<string, unknown>}
 */
const DEFAULTS = {
	css: 'external',
	customElement: false,
	dev: false,
	discloseVersion: true,
	hmr: false,
	modernAst: false,
	namespace: 'html',
	preserveComments: false,
	runes: true,
};

const COMPONENT = new Set([
	'filename',
	'generate',
	'preserveWhitespace',
	'rootDir',
	'sourcemap',
	'warningFilter',
]);
const MODULE = new Set(['filename', 'generate', 'rootDir', 'warningFilter']);

/**
 * `compile` and `compileModule` over `binding`.
 * @param {Compiler} binding
 */
export function compiler(binding) {
	return {
		/**
		 * @param {string} source
		 * @param {Record<string, unknown>} [options]
		 */
		compile(source, options = {}) {
			return result(source, options, binding.compile(source, taken(options, COMPONENT)));
		},
		/**
		 * @param {string} source
		 * @param {Record<string, unknown>} [options]
		 */
		compileModule(source, options = {}) {
			return result(source, options, binding.compileModule(source, taken(options, MODULE)));
		},
	};
}

/**
 * The options the binding reads; throws on any other option that is not at its default.
 * @param {Record<string, unknown>} options
 * @param {Set<string>} names
 */
function taken(options, names) {
	for (const [name, value] of Object.entries(options)) {
		if (value === undefined || names.has(name)) continue;
		if (!Object.hasOwn(DEFAULTS, name)) {
			throw new Error(`rsvelte/compiler does not take the option \`${name}\` yet`);
		}
		if (value !== DEFAULTS[name]) {
			throw new Error(
				`rsvelte/compiler takes \`${name}\` only as ${JSON.stringify(DEFAULTS[name])}`,
			);
		}
	}
	const { generate, preserveWhitespace } = options;
	const filename = relative(options);
	if (generate === false) throw new Error('rsvelte/compiler does not take `generate: false` yet');
	return { filename, generate, preserveWhitespace };
}

/**
 * The filename below `rootDir`, which defaults to the working directory where there is one: the
 * CSS hash and the diagnostics read it.
 * @param {Record<string, unknown>} options
 */
function relative({ filename, rootDir = globalThis.process?.cwd?.() }) {
	if (typeof filename !== 'string') return undefined;
	const root = typeof rootDir === 'string' ? rootDir.replace(/\\/g, '/') : undefined;
	if (root === undefined || !filename.startsWith(root)) return filename;
	return filename.replace(root, '').replace(/^[/\\]/, '');
}

/**
 * @param {string} source
 * @param {Record<string, unknown>} options
 * @param {Outcome} outcome
 */
function result(source, options, outcome) {
	const filename = relative(options);
	if (outcome.error) throw compileError(diagnostic(source, filename, outcome.error));
	const { js, css, warnings } = /** @type {NonNullable<typeof outcome.compiled>} */ (
		outcome.compiled
	);
	const filter = /** @type {(warning: unknown) => boolean} */ (
		typeof options.warningFilter === 'function' ? options.warningFilter : () => true
	);
	return {
		js: {
			code: js.code,
			map: sourceMap(/** @type {string} */ (js.map), source, options.sourcemap),
		},
		css: css ? { code: css.code, map: null } : null,
		warnings: warnings
			.map((warning) => diagnostic(source, filename, warning, 'CompileWarning'))
			.filter((warning) => filter(warning)),
		metadata: { runes: true },
	};
}

/**
 * The fields of svelte's CompileDiagnostic.
 * @param {string} source
 * @param {string | undefined} filename
 * @param {Report} report
 * @param {string} [name]
 */
function diagnostic(source, filename, { code, message, start, end }, name = 'CompileError') {
	const fields = {
		code,
		message,
		...(filename === undefined ? {} : { filename }),
		position: [start.character, end.character],
		start,
		end,
		frame: codeFrame(source, start.line - 1, end.column),
	};
	return Object.defineProperties(fields, {
		name: { value: name },
		toString: { value: () => describe(fields) },
	});
}

/** @param {any} fields */
function compileError(fields) {
	const error = new Error(fields.message);
	error.stack = '';
	Object.assign(error, fields);
	error.name = 'CompileError';
	error.toString = () => describe(fields);
	return error;
}

/** @param {any} fields */
function describe({ code, message, filename, start, frame }) {
	let out = `${code}: ${message}`;
	if (filename) out += `\n${filename}:${start.line}:${start.column}`;
	return `${out}\n${frame}`;
}

/** @param {string} line */
const tabsToSpaces = (line) => line.replace(/^\t+/, (tabs) => tabs.split('\t').join('  '));

/**
 * svelte's code frame: two lines before the line, the line with a caret at `column`, two after.
 * @param {string} source
 * @param {number} line
 * @param {number} column
 */
function codeFrame(source, line, column) {
	const lines = source.split('\n');
	const first = Math.max(0, line - 2);
	const last = Math.min(line + 3, lines.length);
	const digits = String(last + 1).length;
	return lines
		.slice(first, last)
		.map((content, i) => {
			const number = String(i + first + 1).padStart(digits, ' ');
			if (first + i !== line) return `${number}: ${tabsToSpaces(content)}`;
			const caret = ' '.repeat(digits + 2 + tabsToSpaces(content.slice(0, column)).length) + '^';
			return `${number}: ${tabsToSpaces(content)}\n${caret}`;
		})
		.join('\n');
}
