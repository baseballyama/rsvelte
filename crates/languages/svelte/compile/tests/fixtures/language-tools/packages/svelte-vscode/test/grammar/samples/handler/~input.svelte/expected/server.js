import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div></div> `);
	Component($$renderer, {});
	$$renderer.push(`<!---->`);
}