import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { initializeDocumentPrinter, renderDocument, stringWidth } from './document-browser.ts';

beforeAll(async () => {
	const bytes = await readFile(new URL('../wasm/kernel/rsvelte_kernel_browser_bg.wasm', import.meta.url));
	await initializeDocumentPrinter(bytes);
});

describe('Rust document printer through WebAssembly', () => {
	it('trace events name the layout instruction they describe', () => {
		const result = renderDocument('group(["hello", line, "world"])', 5, false);
		const group = result.trace.find(event => event.kind === 'group');
		expect(group).toBeDefined();
		expect(group).toHaveProperty('layoutInstructionIdentifier', expect.any(Number));
	});
	const call = 'group("f(", indent([softline, join([",", line], ["aaaa", "bbbb"])]), softline, ")")';

	it('prints the DSL in flat and broken layouts', () => {
		const flat = renderDocument(call, 80, false);
		const broken = renderDocument(call, 10, false);
		expect(flat.ok && flat.output).toBe('f(aaaa, bbbb)');
		expect(broken.ok && broken.output).toBe('f(\n  aaaa,\n  bbbb\n)');
		expect(broken.trace).toEqual([
			expect.objectContaining({ kind: 'group', position: 0, remainingWidth: 10, mode: 'break', why: 'does-not-fit' })
		]);
	});

	it('uses the kernel width tables', () => {
		expect(stringWidth('abc')).toBe(3);
		expect(stringWidth('日本語')).toBe(6);
		expect(stringWidth('é')).toBe(1);
		expect(stringWidth('🏳️‍🌈')).toBe(2);
	});

	it('preserves named groups and flat-only refusal', () => {
		const named = renderDocument('[groupId("g", "x", line, "y"), ifBreakOf("g", "!", "?")]', 3, false);
		expect(named.ok && named.output).toBe('x\ny!');
		const refused = renderDocument('flatOnly("xxxxxxxxxx")', 4, false);
		expect(refused).toEqual(expect.objectContaining({ ok: false, refused: true }));
	});

	it('reports DSL errors in JavaScript UTF-16 offsets', () => {
		const result = renderDocument('["日", @]', 80, false);
		expect(result).toEqual(expect.objectContaining({ ok: false, refused: false, at: 6 }));
	});

	it('breaks fill separators after forced groups', () => {
		const result = renderDocument('fill([groupBroken(["a", line, "b"]), line, "c"])', 80, false);
		expect(result.ok && result.output).toBe('a\nb\nc');
		expect(result.trace).toContainEqual(expect.objectContaining({
			kind: 'fill', contentFits: false, separatorFits: false
		}));
	});

	it('prints tab indentation and preserves literal-line whitespace', () => {
		const tabs = renderDocument('group([indent(["a ", hardline, "b"]), line])', 80, true);
		expect(tabs.ok && tabs.output).toBe('a\n\tb\n');
		const literal = renderDocument('indent(["a ", literalline, "b"])', 80, false);
		expect(literal.ok && literal.output).toBe('a \nb');
	});
});
