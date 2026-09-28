import { describe, expect, it } from 'vitest';
import { defaultOptions } from './doc.ts';
import { DslError, parseDoc } from './doc-dsl.ts';

const print = (src: string, width = 80) => {
	const { docs, root } = parseDoc(src);
	return docs.print(root, { ...defaultOptions, width });
};

describe('doc DSL', () => {
	const call = 'group("f(", indent([softline, join([",", line], ["aaaa", "bbbb"])]), softline, ")")';

	it('builds the same document as the Rust test helper', () => {
		expect(print(call)).toBe('f(aaaa, bbbb)');
		expect(print(call, 10)).toBe('f(\n  aaaa,\n  bbbb\n)');
	});

	it('names groups for ifBreakOf', () => {
		expect(print('[groupId("g", "x", line, "y"), ifBreakOf("g", "!", "?")]', 3)).toBe('x\ny!');
		expect(print('[groupId("g", "x", line, "y"), ifBreakOf("g", "!", "?")]')).toBe('x y?');
	});

	it('reports where the input is wrong', () => {
		expect(() => parseDoc('group("a"')).toThrow(DslError);
		try {
			parseDoc('indent("a", "b")');
		} catch (e) {
			expect((e as DslError).at).toBe(0);
		}
	});
});
