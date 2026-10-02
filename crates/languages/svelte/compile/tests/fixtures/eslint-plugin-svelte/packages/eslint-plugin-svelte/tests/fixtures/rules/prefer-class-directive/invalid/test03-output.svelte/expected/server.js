import * as $ from 'svelte/internal/server';

export default function Test03_output($$renderer) {
	let a = true;
	let b = true;
	let c = ' ';

	$$renderer.push(`<button${$.attr_class('', void 0, { 'a': a })}>foo</button> <button${$.attr_class($.clsx(a ? ` a ${b}` : ''))}>foo</button> <button${$.attr_class($.clsx(a ? ` a ` : c))}>foo</button>`);
}