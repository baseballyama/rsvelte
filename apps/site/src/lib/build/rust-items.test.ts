import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRustModule } from './rust-items.ts';

const kernel = path.resolve(import.meta.dirname, '../../../../../crates/kernel/src');

describe('parseRustModule', () => {
	it('names impl methods after their type and keeps doc comments', () => {
		const m = parseRustModule('t', 't.rs', readFileSync(path.join(kernel, 'output/emitter.rs'), 'utf8'));
		const lookup = m.items.find((i) => i.name === 'Emitter::lookup');
		expect(lookup?.docs).toMatch(/greatest lower bound/);
		expect(lookup?.code.split('\n').at(-1)?.trim()).toBe('}');
		expect(m.items.map((i) => i.name)).toContain('impl Emitter');
		expect(m.docs).toMatch(/^Producing text/);
	});

	it('finds macros, including exported ones', () => {
		const m = parseRustModule('k/m', 'm.rs', '/// Makes an id.\n#[macro_export]\nmacro_rules! newtype {\n    () => {};\n}\n');
		expect(m.items.map((i) => [i.name, i.kind, i.startLine])).toEqual([['newtype!', 'macro_rules!', 1]]);
	});

	it('is not confused by braces in literals, char literals and lifetimes', () => {
		const source = [
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
		const names = parseRustModule('t', 't.rs', source).items.map((i) => [i.name, i.startLine, i.endLine]);
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
		for (const f of readdirSync(kernel, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.rs'))) {
			const source = readFileSync(path.join(kernel, f), 'utf8');
			const m = parseRustModule(f, f, source);
			const topFns = [...source.matchAll(/^(?:pub )?fn (\w+)/gm)].map((x) => x[1]);
			for (const name of topFns) expect(m.items.map((i) => i.name), `${f}: ${name}`).toContain(name);
		}
	});
});
