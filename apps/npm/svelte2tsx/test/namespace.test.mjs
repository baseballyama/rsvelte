// `namespace: 'foreign'` must survive the JS -> wasm boundary and change the
// output. Upstream svelte2tsx derives `preserveAttributeCase` from it
// (`htmlxtojsx_v2/index.ts`), so element attribute names keep their source
// casing. Every assertion is paired against the default namespace so an option
// that is merely *accepted* — parsed but inert — still fails here.
import assert from 'node:assert/strict';
import test from 'node:test';

import { svelte2tsx } from '../index.js';

// The upstream `attributes-foreign-ns` sample.
const source = `<element someAttr="hi" someOtherAttribute="there">hello</element>
<Component someAttr="5" otherAttr={6} />`;

const project = (namespace) =>
	svelte2tsx(source, { filename: 'T.svelte', version: '5', namespace }).code;

test("namespace: 'foreign' preserves element attribute case", () => {
	const code = project('foreign');
	assert.ok(code.includes('"someAttr":'), 'someAttr keeps its casing');
	assert.ok(code.includes('"someOtherAttribute":'), 'someOtherAttribute keeps its casing');
	assert.ok(!code.includes('"someattr":'), 'no lowercased element attribute');
});

test('the default namespace lowercases element attribute case', () => {
	const code = project(undefined);
	assert.ok(code.includes('"someattr":'), 'someAttr is folded to lower case');
	assert.ok(code.includes('"someotherattribute":'));
});

// The discriminating assertion: without it both tests above would still pass on
// a build that never folds attribute case at all.
test("namespace: 'foreign' actually changes the output", () => {
	assert.notEqual(project('foreign'), project(undefined));
});

test('an unrecognised namespace behaves like the default', () => {
	assert.equal(project('nonsense'), project(undefined));
});
