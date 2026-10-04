import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
	nameFindings, sourceFindings, scriptFindings, checkCodeNames, manifestFindings, upstreamNames, traitParameterNamesEnforced, pathFindings, keepsWriteBuffer, WRITE_BUFFER_FILE
} from './code-names.mjs';

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

const kept = (source, options) => sourceFindings(source, options).map(finding => `${finding.qualified}@${finding.line}`);

test('keeps a Rust name only where it copies a public Svelte name that the installed types still declare', () => {
	const names = upstreamNames([{ file: 'a.rs', name: 'Namespace::Html', upstream: "type Namespace = 'html'" }], "type Namespace = 'html' | 'svg';");
	const upstream = names.get('a.rs');
	assert.deepEqual(kept('pub enum Namespace {\n Html,\n}\npub(super) enum Namespaces {\n Html,\n}', { upstreamNames: upstream }), ['Namespaces::Html@5']);
	assert.deepEqual(kept('pub enum Other {\n Html,\n}', { upstreamNames: upstream }), ['Other::Html@2']);
	assert.deepEqual(kept('pub struct BufReader;\nstruct Ctx;', { upstreamNames: upstream }), ['BufReader@1', 'Ctx@2']);
	assert.throws(() => upstreamNames([{ file: 'a.rs', name: 'CssHash', upstream: 'cssHash?: CssHashGetter;' }], 'export {};'), /no longer contain/);
});

test('skips only the buf parameter of std::io::Write::write, and only while the workspace lint keeps it', () => {
	const options = { traitParameterNamesEnforced: true };
	const write = (header, parameter = 'buf: &[u8]') => `${header}\nimpl Write for B {\n fn write(&mut self, ${parameter}) -> usize { 0 } }`;
	assert.deepEqual(kept(write('use std::io::{Read, Write};'), options), []);
	assert.deepEqual(kept(write('use std::io::Write;'), options), []);
	assert.deepEqual(kept('impl std::io::Write for B {\n fn write(&mut self, buf: &[u8]) -> usize { 0 } }', options), []);
	assert.deepEqual(kept('use std::io;\nimpl io::Write for B {\n fn write(&mut self, buf: &[u8]) -> usize { 0 } }', options), []);
	assert.deepEqual(kept(write('use std::io::{Read, Write};')), ['buf@3']);
	assert.deepEqual(kept(write('use std::io::{Read, Write};', 'ctx: &[u8]'), options), ['ctx@3']);
	assert.deepEqual(kept(write('use std::io::{Read, Write};', 'mut buf: &[u8]'), options), ['buf@3']);
	assert.deepEqual(kept(write('use std::fmt::Write;'), options), ['buf@3']);
	assert.deepEqual(kept(write('trait Write { fn write(&mut self, buf: &[u8]) -> usize; }'), options), ['buf@1', 'buf@3']);
	assert.deepEqual(kept('use std::io::Write;\nimpl Write for B {\n fn write_all(&mut self, buf: &[u8]) {} }', options), ['buf@3']);
	assert.deepEqual(kept('impl B {\n fn write(&mut self, buf: &[u8]) {} }', options), ['buf@2']);
	assert.deepEqual(kept('impl From<u8> for B {\n fn from(buf: u8) -> Self { Self(buf) } }', options), ['buf@2']);
	assert.equal(traitParameterNamesEnforced('[workspace.lints.clippy]\nrenamed_function_params = "deny"\n', ''), true);
	assert.equal(traitParameterNamesEnforced('[workspace.lints.clippy]\nrenamed_function_params = "deny"\n', 'allow-renamed-params-for = ["..", "std::io::Write"]'), false);
	assert.equal(traitParameterNamesEnforced('[workspace.lints.clippy]\nrenamed_function_params = "warn"\n', ''), false);
});

test('allows only the css and html language directories directly under crates/languages', () => {
	assert.deepEqual(pathFindings('languages/css/core/src/lib.rs'), []);
	assert.deepEqual(pathFindings('languages/html/core/Cargo.toml'), []);
	assert.deepEqual(pathFindings('languages/css/core/src/ctx.rs'), ['ctx']);
	assert.deepEqual(pathFindings('languages/css/css/src/lib.rs'), ['css']);
	assert.deepEqual(pathFindings('languages/svelte/compile/src/css.rs'), ['css']);
	assert.deepEqual(pathFindings('languages/svelte/hir/src/lib.rs'), ['hir']);
	assert.deepEqual(pathFindings('languages/hir/core/src/lib.rs'), ['hir']);
	assert.deepEqual(pathFindings('languages/ctx/core/src/lib.rs'), ['ctx']);
	assert.deepEqual(pathFindings('hosts/css/src/lib.rs'), ['css']);
	assert.deepEqual(pathFindings('languages/js/core/src/lib.rs'), ['js']);
	assert.deepEqual(pathFindings('languages/ts/x/Cargo.toml'), ['ts']);
});

test('keeps the std Write::write buf only in the one file that implements it, and fails when it is gone', () => {
	const wire = readFileSync(path.join('../../crates', WRITE_BUFFER_FILE), 'utf8');
	assert.equal(keepsWriteBuffer(wire), true);
	assert.equal(keepsWriteBuffer(wire.replace('buf: &[u8]', 'bytes: &[u8]')), false);
	assert.equal(keepsWriteBuffer('use std::io::Read;\nimpl Read for X {\n fn read(&mut self, buf: &mut [u8]) -> usize { 0 } }'), false);
	const root = mkdtempSync(path.join(tmpdir(), 'code-names-'));
	const put = (file, text) => { mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); writeFileSync(path.join(root, file), text); };
	put('Cargo.toml', '[workspace.lints.clippy]\nrenamed_function_params = "deny"\n');
	put('apps/site/src/empty.ts', '');
	put(path.join('crates', WRITE_BUFFER_FILE), wire);
	put('crates/hosts/other/src/lib.rs', 'use std::io::Write;\nimpl Write for B {\n fn write(&mut self, buf: &[u8]) -> usize { 0 } }');
	const bufferErrors = () => checkCodeNames(root).errors.filter(error => /\bbuf\b/.test(error));
	assert.deepEqual(bufferErrors(), ['hosts/other/src/lib.rs:3: buf: use buffer']);
	put(path.join('crates', WRITE_BUFFER_FILE), wire.replace('buf: &[u8]', 'bytes: &[u8]'));
	assert.deepEqual(bufferErrors(), ['hosts/other/src/lib.rs:3: buf: use buffer', `${WRITE_BUFFER_FILE}: no std Write::write with a buf parameter is declared there`]);
	put(path.join('crates', WRITE_BUFFER_FILE), wire);
	put('Cargo.toml', '[workspace.lints.clippy]\nrenamed_function_params = "warn"\n');
	assert.deepEqual(bufferErrors().map(error => error.split(':')[0]).sort(), [WRITE_BUFFER_FILE, 'hosts/other/src/lib.rs']);
});
