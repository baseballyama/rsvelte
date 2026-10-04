import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nameFindings, sourceFindings, scriptFindings, checkCodeNames, manifestFindings } from './code-names.mjs';

test('rejects abbreviated names in paths and identifiers, not substrings', () => {
	for (const name of ['db.rs', 'rsv_kernel/src/idx.rs', 'Ctx', 'TsDoc', 'NodeIdx', 'source_pos', 'Ast']) {
		assert.notDeepEqual(nameFindings(name), [], name);
	}
	for (const name of ['database.rs', 'DocumentContext', 'TypedIndex', 'position', 'stylesheet', 'display']) {
		assert.deepEqual(nameFindings(name), [], name);
	}
});

test('checks real code while ignoring comments and source-language string literals', () => {
	const source = '// Ctx\nconst SOURCE: &str = r#"Ast { ctx }"#;\nstruct Ctx { source_pos: usize }';
	assert.deepEqual(sourceFindings(source).map(finding => finding.name), ['Ctx', 'source_pos']);
	assert.deepEqual(sourceFindings('struct DocumentContext { position: usize }'), []);
	assert.throws(() => sourceFindings('struct Broken {'), /unbalanced braces/);
	assert.deepEqual(sourceFindings('use std::path::PathBuf; fn read(path: PathBuf) {}'), []);
	assert.equal(sourceFindings('struct PathBuf;').length, 1);
});

test('all first-party source names follow the policy', () => {
	const result = checkCodeNames('../..');
	assert.ok(result.files > 0);
	assert.deepEqual(result.errors, []);
});

test('rejects shortened script declarations while allowing external property names', () => {
	assert.deepEqual(scriptFindings('const ctx = library.ctx; // ctx', 'example.ts').map(finding => finding.name), ['ctx']);
	assert.deepEqual(scriptFindings('<script lang="ts">let src = "ctx";</script><p>{src}</p>', 'example.svelte').map(finding => finding.name), ['src']);
	assert.deepEqual(scriptFindings('const { params: parameters } = request;', 'example.ts'), []);
});

const declared = source => sourceFindings(source).map(finding => `${finding.name}@${finding.line}`);

test('reports each first-party declaration once and not its uses', () => {
	assert.deepEqual(declared('fn f() { let ctx = 1; ctx + ctx; }'), ['ctx@1']);
	assert.deepEqual(declared("struct L<'ctx> {\n a: &'ctx u8,\n b: &'ctx u8 }"), ['ctx@1']);
	assert.deepEqual(declared('fn ts() {}\nfn g() { SourceType::ts(); }'), ['ts@1']);
	assert.deepEqual(declared("fn f<F>(g: F) where F: for<'ctx> Fn(&'ctx u8) {}"), ['ctx@1']);
	assert.deepEqual(declared('thread_local! {\n static CTX: u8 = 0;\n}'), ['CTX@2']);
	assert.deepEqual(declared('macro_rules! make {\n () => { fn ctx_value() {} struct Ctx; }\n}'), ['ctx_value@2', 'Ctx@2']);
});

test('finds names bound by patterns, parameters and closures', () => {
	assert.deepEqual(declared('impl std::io::Write for B {\n fn write(&mut self, buf: &[u8]) -> usize { buf.len() } }'), ['buf@2']);
	assert.deepEqual(declared('impl std::io::Write for B {\n fn write(&mut self, ctx: &[u8]) -> usize { ctx.len() } }'), ['ctx@2']);
	assert.deepEqual(declared('impl Buffer {\n fn write(&mut self, buf: &[u8]) -> usize { buf.len() } }'), ['buf@2']);
	assert.deepEqual(declared('impl std::io::Write for C {\n fn write(&mut self, _ctx: &[u8]) -> usize { let src = 0; src } }'), ['_ctx@2', 'src@2']);
	assert.deepEqual(declared('impl PartialEq<Pair> for D {\n fn eq(&self, Pair(ctx, _): &Pair) -> bool { true } }'), ['ctx@2']);
	assert.deepEqual(declared('impl From<u8> for B {\n fn from(ctx: u8) -> Self { Self(ctx) } }'), ['ctx@2']);
	assert.deepEqual(declared('fn f() { let g = |src: Vec<Vec<u8>>, n: u8| src.len();\n let ctx = 2; }'), ['src@1', 'ctx@2']);
	assert.deepEqual(declared('fn f(t: &str) { if matches!(t, "a" | "b") {}\n let html = 1; }'), ['html@2']);
	assert.deepEqual(declared('fn f(x: T) {\n let Outer { a: (ctx, Inner { src, .. }), .. } = x;\n}'), ['ctx@2', 'src@2']);
	assert.deepEqual(declared('fn f(((lo, hi), _): ((u32, u32), u8)) {}'), ['lo@1', 'hi@1']);
	assert.deepEqual(declared('fn f() { v.iter().map(|&(lo, (hi, _))| lo + hi); }'), ['lo@1', 'hi@1']);
	assert.deepEqual(declared('fn f(x: Option<Pair>) {\n if let Some(Pair { value: src }) = x {}\n}'), ['src@2']);
	assert.deepEqual(declared('fn f() {\n for (idx, item) in v {}\n}'), ['idx@2']);
	assert.deepEqual(declared('fn f(x: E) {\n match x { E::A { inner: Some((ctx, _)) } if ctx > 0 => {}, _ => {} }\n}'), ['ctx@2']);
	assert.deepEqual(declared('fn f(x: Option<u8>) -> u8 { match x { Some(ctx) => ctx, None => 0 } }'), ['ctx@1']);
	assert.deepEqual(declared('fn f() -> impl Fn(u8) -> u8 {\n return |ctx| ctx;\n}'), ['ctx@2']);
});

test('does not report names that std, dependencies, traits or literals impose', () => {
	for (const source of [
		'use std::io::{BufRead, BufReader};\nfn f(r: impl BufRead) { BufReader::new(r); }',
		'use oxc_ast::ast::Program;\nfn f(p: &Program) {}',
		'fn f() { let x = SourceType::ts(); x.to_path_buf(); }',
		'fn f() { let c = Configuration { css_hash: None }; }',
		'impl other::Trait for T {\n fn to_src(&self) {} }',
		'impl std::str::FromStr for Doc {\n type Err = Error;\n fn from_str(text: &str) -> Result<Self, Self::Err> { todo!() }\n}',
		"fn f(a: &'static str) {}\nimpl<'a> X<'a> { fn g(&self) -> &'a str { self.0 } }",
		'fn f() { call(&["css", "ctx", "html"]); let x = r#"let src = 1"#; }',
		'macro_rules! make {\n ($name:ident) => { fn $name() {} };\n}',
		'fn f() -> std::fmt::Result { Ok(()) }',
		'fn f() { g(|value: Pair<u8, ctx>, other: fn(u8, src) -> u8| value); }',
	]) assert.deepEqual(declared(source), [], source);
});

test('checks crate names where the manifest declares them', () => {
	assert.deepEqual(manifestFindings('[package]\nname = "rsvelte_svelte_hir"\nversion = "0.1.0"\n').map(finding => finding.name), ['rsvelte_svelte_hir']);
	assert.deepEqual(manifestFindings('[package]\nname = "rsvelte_kernel"\n[dependencies]\nhir = { path = "x" }\n'), []);
});
