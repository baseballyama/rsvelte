import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, { someProp: true });
	$$renderer.push(`<!----> `);
	Component($$renderer, { someProp: true });
	$$renderer.push(`<!---->`);
}