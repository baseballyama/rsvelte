import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div></div> <div></div> `);
	Comp($$renderer, {});
	$$renderer.push(`<!----> `);
	Comp($$renderer, {});
	$$renderer.push(`<!---->`);
}