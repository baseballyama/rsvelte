import remapping from '@jridgewell/remapping';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import { mapToRelative } from './sourcemaps.js';

// remapping resolves a loaded map's sources against the URI of the source it
// replaces, so a name with a directory component would rewrite relative sources
// into absolute ones. A bare name leaves every spelling untouched.
const PRE_EDIT_SOURCE = 'rsvelte-pre-edit-source';

/** @param {any} callee */
function isHotAcceptCallee(callee) {
	return (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier' &&
		callee.property.name === 'accept' &&
		callee.object.type === 'MemberExpression' &&
		!callee.object.computed &&
		callee.object.property.type === 'Identifier' &&
		callee.object.property.name === 'hot' &&
		callee.object.object.type === 'MetaProperty' &&
		callee.object.object.meta.name === 'import' &&
		callee.object.object.property.name === 'meta'
	);
}

/**
 * @param {any} node
 * @param {any[]} calls
 */
function collectHotAcceptCalls(node, calls) {
	if (!node || typeof node !== 'object') return;
	if (node.type === 'CallExpression' && isHotAcceptCallee(node.callee)) {
		calls.push(node);
	}
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const child of value) collectHotAcceptCalls(child, calls);
		} else if (value && typeof value === 'object' && typeof value.type === 'string') {
			collectHotAcceptCalls(value, calls);
		}
	}
}

/**
 * @param {{ js: { code: string, map: any } }} compiled
 * @param {(editor: MagicString, code: string) => void} edit
 */
export function applyMapEdits(compiled, edit) {
	const editor = new MagicString(compiled.js.code);
	edit(editor, compiled.js.code);
	const previousMap = compiled.js.map;
	compiled.js.code = editor.toString();
	if (!previousMap) return;
	const editMap = editor.generateMap({ hires: true, source: PRE_EDIT_SOURCE });
	let loadedPreviousMap = false;
	const composed = remapping(/** @type {any} */ (editMap), (source) => {
		if (source !== PRE_EDIT_SOURCE || loadedPreviousMap) return null;
		loadedPreviousMap = true;
		return /** @type {any} */ (previousMap);
	});
	// the edit map carries no `file`, so composing would otherwise drop it
	if (previousMap.file != null) {
		/** @type {any} */ (composed).file = previousMap.file;
	}
	compiled.js.map = composed;
}

/**
 * Rewrite the compiled JavaScript for the dev server — HMR partial accept and the
 * emitted-CSS import — keeping `js.map` in step with every edit.
 *
 * @param {{ js: { code: string, map: any }, css?: { map?: any } | null }} compiled
 * @param {{ filename: string, cssId: string, partialAccept: boolean, emitCssImport: boolean }} options
 */
export function postprocessCompiled(compiled, { filename, cssId, partialAccept, emitCssImport }) {
	if (partialAccept && compiled.js.code.includes('import.meta.hot')) {
		applyMapEdits(compiled, (editor, generated) => {
			addPartialAcceptExports(editor, generated);
		});
	}
	mapToRelative(compiled.js?.map, filename);
	mapToRelative(compiled.css?.map, filename);
	if (emitCssImport) {
		applyMapEdits(compiled, (editor) => {
			editor.append(`\nimport ${JSON.stringify(cssId)};\n`);
		});
	}
}

/**
 * @param {MagicString} editor
 * @param {string} code
 */
export function addPartialAcceptExports(editor, code) {
	const calls = [];
	collectHotAcceptCalls(parse(code, { ecmaVersion: 'latest', sourceType: 'module' }), calls);
	for (const call of calls) {
		const firstArgument = call.arguments[0];
		if (!firstArgument || firstArgument.type === 'SpreadElement') continue;
		editor.overwrite(
			call.callee.start,
			firstArgument.start,
			`${code.slice(call.callee.start, call.callee.end)}Exports([\"default\"],`
		);
	}
}
