import * as $ from 'svelte/internal/server';

export default function Transform_test02_output($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button${$.attr_class('', void 0, { 'a-or-b': a || b, 'not-a-and-not-b': !(a || b) })}>foo</button> <button${$.attr_class('', void 0, { 'c-and-d': !(c && d), 'not-c-and-d': c && d })}>foo</button>`);
}