import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	$$renderer.push(`<svg${$.attr_class($.clsx(count))}></svg> <button></button>`);
}