import * as $ from 'svelte/internal/server';

export default function Transform_test02_input($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button${$.attr_class($.clsx(a || b ? 'a-or-b' : 'not-a-and-not-b'))}>foo</button> <button${$.attr_class($.clsx(!(c && d) ? 'c-and-d' : 'not-c-and-d'))}>foo</button>`);
}