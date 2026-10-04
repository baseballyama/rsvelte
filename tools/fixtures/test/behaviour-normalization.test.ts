import assert from 'node:assert/strict';
import test from 'node:test';
import { serializeHtml } from '../src/behaviour/dom.ts';

// Pairs that look different in markup and the same on screen, and pairs that look different.
const same: [string, string][] = [
	['<template><p>a<!---->b</p></template>', '<template><p>ab</p></template>'],
	['<p>a<!---->b</p>', '<p>ab</p>'],
	['<!--[--><p>x</p><!--]-->', '<p>x</p>'],
	['<p data-v-1a2b3c4d="">x</p>', '<p>x</p>'],
	['<p class="svelte-1x2y3z a">x</p>', '<p class="a">x</p>'],
	['<p class="b a a">x</p>', '<p class="a b">x</p>'],
	['<p class="svelte-1x2y3z">x</p>', '<p>x</p>'],
	['<p id="i" title="t">x</p>', '<p title="t" id="i">x</p>'],
	[
		'<p style="color:red;margin: 0">x</p>',
		'<p style="margin:0; color: red;">x</p>',
	],
	['<div>\n  <p>x</p>\n  <p>y</p>\n</div>', '<div><p>x</p><p>y</p></div>'],
	['<p>  a \n b  </p>', '<p>a b</p>'],
	['<span>a</span> <p>b</p>', '<span>a</span><p>b</p>'],
	['<span>a</span><br> <span>b</span>', '<span>a</span><br><span>b</span>'],
];
const different: [string, string][] = [
	['<template><p>a</p></template>', '<template><p>b</p></template>'],
	[
		'<template><template>a</template></template>',
		'<template><template>b</template></template>',
	],
	['<span>a</span> <span>b</span>', '<span>a</span><span>b</span>'],
	['<span>a</span>\n<span>b</span>', '<span>a</span><span>b</span>'],
	['<pre> a  b</pre>', '<pre>a b</pre>'],
	['<p>a</p>', '<p>b</p>'],
	['<p title="t">x</p>', '<p title="u">x</p>'],
	['<p class="svelte-1x2y3z extra">x</p>', '<p>x</p>'],
	['<p hidden>x</p>', '<p>x</p>'],
	['<input value="a">', '<input value="b">'],
	['<input type="checkbox" checked>', '<input type="checkbox">'],
	[
		'<select><option>a</option><option selected>b</option></select>',
		'<select><option>a</option><option>b</option></select>',
	],
	['<p>a</p><p>b</p>', '<p>b</p><p>a</p>'],
];

test('normalization: invisible differences vanish, visible ones stay', () => {
	for (const [a, b] of same)
		assert.deepEqual(serializeHtml(a), serializeHtml(b), `${a} vs ${b}`);
	for (const [a, b] of different)
		assert.notDeepEqual(serializeHtml(a), serializeHtml(b), `${a} vs ${b}`);
});

test('stylesheet normalization keeps CSS changes visible', () => {
	const expected = serializeHtml('<style>p { color: red; }</style>');
	assert.deepEqual(serializeHtml('<style>p{color:red}</style>'), expected);
	assert.notDeepEqual(serializeHtml('<style>p{color:blue}</style>'), expected);
});
