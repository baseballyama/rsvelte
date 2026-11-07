import * as $ from 'svelte/internal/server';

export default function Input_1($$renderer) {
	$$renderer.push(`<div></div> <div></div> `);
	Input($$renderer, {});
	$$renderer.push(`<!----> `);
	Input($$renderer, {});
	$$renderer.push(`<!---->`);
}