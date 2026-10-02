import * as $ from 'svelte/internal/server';

export let data;
export let errors;
export let foo;
export let bar;

export default function _page($$renderer) {
	$$renderer.push(`<!---->${$.escape(data)}, ${$.escape(errors)}, ${$.escape(foo)}, ${$.escape(bar)}`);
}