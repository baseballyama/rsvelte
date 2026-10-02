import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let bar = "bar";

	$$renderer.push(`<div data-foo=""${$.attr('data-bar', bar)}></div> <div${$.attr_class($.clsx(bar))}></div> <div this-is="wrong"></div> <div${$.attr('bar', bar)}></div>`);
}