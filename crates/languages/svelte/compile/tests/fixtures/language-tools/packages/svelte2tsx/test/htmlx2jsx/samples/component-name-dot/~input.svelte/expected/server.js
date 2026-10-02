import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Dotted.ComponentName($$renderer, {});
	$$renderer.push(`<!----> `);
	Dotted.ComponentName($$renderer, {});
	$$renderer.push(`<!---->`);
}