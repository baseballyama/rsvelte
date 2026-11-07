import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);

	Widget($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<line x1="0" y1="0" x2="100" y2="100"></line>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}