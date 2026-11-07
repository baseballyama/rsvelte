import * as $ from 'svelte/internal/server';

export default function Ignore_test02_input($$renderer) {
	let a = true;
	let b = true;

	$$renderer.push(`<button${$.attr_class($.clsx(a ? 'a' : !b ? 'no-b' : 'b'))}>foo</button>`);
}