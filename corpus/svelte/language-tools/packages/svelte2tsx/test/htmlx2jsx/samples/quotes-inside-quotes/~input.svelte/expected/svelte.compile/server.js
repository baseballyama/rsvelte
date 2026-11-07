import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, { placeholder: '\'' });
	$$renderer.push(`<!----> `);
	Component($$renderer, { placeholder: '"' });
	$$renderer.push(`<!---->`);
}