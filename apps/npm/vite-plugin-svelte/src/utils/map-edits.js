import remapping from '@jridgewell/remapping';
import { parse } from 'acorn';
import MagicString from 'magic-string';

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
 * @param {string} filename
 * @param {(editor: MagicString, code: string) => void} edit
 */
export function applyMapEdits(compiled, filename, edit) {
	const editor = new MagicString(compiled.js.code);
	edit(editor, compiled.js.code);
	const previousMap = compiled.js.map;
	compiled.js.code = editor.toString();
	if (!previousMap) return;
	const editMap = editor.generateMap({ hires: true, source: filename });
	let loadedPreviousMap = false;
	compiled.js.map = remapping(/** @type {any} */ (editMap), (source) => {
		if (source !== filename || loadedPreviousMap) return null;
		loadedPreviousMap = true;
		return /** @type {any} */ (previousMap);
	});
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
