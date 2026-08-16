import { describe, expect, it } from 'vitest';
import MagicString from 'magic-string';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { addPartialAcceptExports, applyMapEdits } from '../src/utils/map-edits.js';

const filename = '/project/Component.svelte';

function positionOf(code, needle) {
	const offset = code.indexOf(needle);
	return {
		line: code.slice(0, offset).split('\n').length,
		column: offset - code.lastIndexOf('\n', offset - 1) - 1
	};
}

function generatedMap(code) {
	return new MagicString(code).generateMap({ hires: true, source: filename });
}

describe('generated JavaScript map edits', () => {
	it('composes HMR and CSS-import edits without moving following mappings', () => {
		const code = [
			'const before = 1;',
			'import.meta.hot.accept(() => {});',
			'const after = before;'
		].join('\n');
		const compiled = { js: { code, map: generatedMap(code) } };

		applyMapEdits(compiled, (editor, generated) => {
			addPartialAcceptExports(editor, generated);
		});
		applyMapEdits(compiled, (editor) => {
			editor.append('\nimport "Component.svelte?style";\n');
		});

		expect(compiled.js.code).toContain('import.meta.hot.acceptExports(["default"],() => {});');
		const position = positionOf(compiled.js.code, 'const after');
		expect(originalPositionFor(new TraceMap(compiled.js.map), position)).toMatchObject({
			source: filename,
			line: 3,
			column: 0
		});
	});

	it('only rewrites import.meta.hot.accept calls', () => {
		const code = 'const text = "import.meta.hot.accept(";\nimport.meta.hot.accept(() => {});';
		const compiled = { js: { code, map: generatedMap(code) } };
		applyMapEdits(compiled, (editor, generated) => {
			addPartialAcceptExports(editor, generated);
		});
		expect(compiled.js.code).toBe(
			'const text = "import.meta.hot.accept(";\nimport.meta.hot.acceptExports(["default"],() => {});'
		);
	});
});
