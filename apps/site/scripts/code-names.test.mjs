import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nameFindings, sourceFindings, scriptFindings, checkCodeNames } from './code-names.mjs';

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
