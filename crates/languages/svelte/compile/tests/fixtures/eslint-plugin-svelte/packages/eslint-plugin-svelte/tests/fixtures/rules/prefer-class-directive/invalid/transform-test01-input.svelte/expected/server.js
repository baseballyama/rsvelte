import * as $ from 'svelte/internal/server';

export default function Transform_test01_input($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button${$.attr_class($.clsx(a ? 'a' : 'not-a'))}>foo</button> <button${$.attr_class($.clsx(!b ? 'no-b' : 'b'))}>foo</button> <button${$.attr_class($.clsx(c === d ? 'c-eq-d' : ''))}>foo</button> <button${$.attr_class($.clsx(c !== d ? 'c-not-eq-d' : 'c-eq-d'))}>foo</button>`);
}