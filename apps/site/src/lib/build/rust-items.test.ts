import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRustModule } from './rust-items.ts';

const kernel = path.resolve(import.meta.dirname, '../../../../../crates/rsv_kernel/src');

describe('parseRustModule', () => {
	it('names impl methods after their type and keeps doc comments', () => {
		const m = parseRustModule('t', 't.rs', readFileSync(path.join(kernel, 'emit.rs'), 'utf8'));
		const lookup = m.items.find((i) => i.name === 'Emitter::lookup');
		expect(lookup?.docs).toMatch(/greatest lower bound/);
		expect(lookup?.code.split('\n').at(-1)?.trim()).toBe('}');
		expect(m.items.map((i) => i.name)).toContain('impl Emitter');
		expect(m.docs).toMatch(/^Producing text/);
	});

	it('is not confused by braces in literals, char literals and lifetimes', () => {
		const src = [
			"fn a<'x>(s: &'x str) -> char { let _ = \"{\"; let _ = '{'; let _ = r#\"}\"#; '}' }",
			'/// doc',
			'pub struct B { x: u32 }',
			"const C: &str = \"}\";",
			'const D: [u8; 2] = [',
			'    1, 2,',
			'];',
			'fn e(x: [u8; 4]) {',
			'}',
			'impl<T> Tr for B {',
			'    fn m(&self) {}',
			'}'
		].join('\n');
		const names = parseRustModule('t', 't.rs', src).items.map((i) => [i.name, i.startLine, i.endLine]);
		expect(names).toEqual([
			['a', 1, 1],
			['B', 2, 3],
			['C', 4, 4],
			['D', 5, 7],
			['e', 8, 9],
			['impl Tr for B', 10, 12],
			['B::m', 11, 11]
		]);
	});

	it('parses every kernel module into items that cover each top-level fn', () => {
		for (const f of readdirSync(kernel).filter((f) => f.endsWith('.rs'))) {
			const src = readFileSync(path.join(kernel, f), 'utf8');
			const m = parseRustModule(f, f, src);
			const topFns = [...src.matchAll(/^(?:pub )?fn (\w+)/gm)].map((x) => x[1]);
			for (const name of topFns) expect(m.items.map((i) => i.name), `${f}: ${name}`).toContain(name);
		}
	});
});
