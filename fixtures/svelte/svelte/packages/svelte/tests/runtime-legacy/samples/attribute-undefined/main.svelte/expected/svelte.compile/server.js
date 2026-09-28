import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div${$.attr_class($.clsx(undefined))}></div>`);
}