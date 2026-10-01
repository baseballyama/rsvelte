import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { initializeDocWasm, renderDoc, stringWidth } from './doc-wasm.ts';

beforeAll(async () => {
	const bytes = await readFile(new URL('../wasm/kernel/rsv_kernel_wasm_bg.wasm', import.meta.url));
	await initializeDocWasm(bytes);
});

describe('Rust document printer through WebAssembly', () => {
	const call = 'group("f(", indent([softline, join([",", line], ["aaaa", "bbbb"])]), softline, ")")';

	it('prints the DSL in flat and broken layouts', () => {
		const flat = renderDoc(call, 80, false);
		const broken = renderDoc(call, 10, false);
		expect(flat.ok && flat.out).toBe('f(aaaa, bbbb)');
		expect(broken.ok && broken.out).toBe('f(\n  aaaa,\n  bbbb\n)');
		expect(broken.trace).toEqual([
			expect.objectContaining({ kind: 'group', pos: 0, rem: 10, mode: 'break', why: 'does-not-fit' })
		]);
	});

	it('uses the kernel width tables', () => {
		expect(stringWidth('abc')).toBe(3);
		expect(stringWidth('日本語')).toBe(6);
		expect(stringWidth('é')).toBe(1);
		expect(stringWidth('🏳️‍🌈')).toBe(2);
	});

	it('preserves named groups and flat-only refusal', () => {
		const named = renderDoc('[groupId("g", "x", line, "y"), ifBreakOf("g", "!", "?")]', 3, false);
		expect(named.ok && named.out).toBe('x\ny!');
		const refused = renderDoc('flatOnly("xxxxxxxxxx")', 4, false);
		expect(refused).toEqual(expect.objectContaining({ ok: false, refused: true }));
	});

	it('reports DSL errors in JavaScript UTF-16 offsets', () => {
		const result = renderDoc('["日", @]', 80, false);
		expect(result).toEqual(expect.objectContaining({ ok: false, refused: false, at: 6 }));
	});

	it('breaks fill separators after forced groups', () => {
		const result = renderDoc('fill([groupBroken(["a", line, "b"]), line, "c"])', 80, false);
		expect(result.ok && result.out).toBe('a\nb\nc');
		expect(result.trace).toContainEqual(expect.objectContaining({
			kind: 'fill', contentFits: false, separatorFits: false
		}));
	});

	it('prints tab indentation and preserves literal-line whitespace', () => {
		const tabs = renderDoc('group([indent(["a ", hardline, "b"]), line])', 80, true);
		expect(tabs.ok && tabs.out).toBe('a\n\tb\n');
		const literal = renderDoc('indent(["a ", literalline, "b"])', 80, false);
		expect(literal.ok && literal.out).toBe('a \nb');
	});
});
