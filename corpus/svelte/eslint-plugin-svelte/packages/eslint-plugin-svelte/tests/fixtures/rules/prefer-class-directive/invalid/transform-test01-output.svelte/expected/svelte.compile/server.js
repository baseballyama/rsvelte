import * as $ from 'svelte/internal/server';

export default function Transform_test01_output($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button${$.attr_class('', void 0, { 'a': a, 'not-a': !a })}>foo</button> <button${$.attr_class('', void 0, { 'no-b': !b, 'b': b })}>foo</button> <button${$.attr_class('', void 0, { 'c-eq-d': c === d })}>foo</button> <button${$.attr_class('', void 0, { 'c-not-eq-d': c !== d, 'c-eq-d': c === d })}>foo</button>`);
}