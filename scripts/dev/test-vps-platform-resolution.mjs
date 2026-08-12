import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveTriple } = require('../../apps/npm/vite-plugin-svelte-native/platform.cjs');

assert.equal(resolveTriple({ platform: 'linux', arch: 'x64', report: { getReport: () => ({ header: { glibcVersionRuntime: '2.35' } }) } }), 'linux-x64-gnu');
assert.equal(resolveTriple({ platform: 'linux', arch: 'arm64', report: { getReport: () => ({ header: {} }) } }), null);
assert.equal(resolveTriple({ platform: 'linux', arch: 'x64', report: { getReport: () => ({ header: {} }) } }), null);
console.log('PASS: musl platforms are rejected before an optional dependency is resolved');
