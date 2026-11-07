import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);

	{
		function children($$renderer) {
			$$renderer.push(`<line x1="0" y1="0" x2="100" y2="100"></line>`);
		}

		Widget($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----></div>`);
}