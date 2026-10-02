import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	$$renderer.push(`<div></div> `);
	SelfClosing($$renderer, { class: 'foo' });
	$$renderer.push(`<!---->`);
}