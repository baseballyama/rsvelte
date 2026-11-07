import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Button($$renderer, {});
	$$renderer.push(`<!----> `);
	Radio($$renderer, {});
	$$renderer.push(`<!---->`);
}