import * as $ from 'svelte/internal/server';

export default function Ignore_test03_input($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button${$.attr_class($.clsx(a && b && c ? 'a b c' : ' '))}>foo</button> <button${$.attr_class($.clsx(d ? '??' : ' '))}>foo</button>`);
}