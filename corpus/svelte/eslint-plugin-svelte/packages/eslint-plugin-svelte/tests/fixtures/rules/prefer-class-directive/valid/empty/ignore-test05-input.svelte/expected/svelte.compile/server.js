import * as $ from 'svelte/internal/server';

export default function Ignore_test05_input($$renderer) {
	let a = true;
	let a7 = 7;
	let danger = false;

	$$renderer.push(`<button${$.attr_class($.clsx(a ? 'a' : 'b'))}>foo</button> <button${$.attr_class($.clsx(!a ? 'b' : 'a'))}>foo</button> <button${$.attr_class($.clsx(a7 === 7 ? 'a' : 'b'))}>foo</button> <button class="btn btn-primary">foo</button>`);
}