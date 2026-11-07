import * as $ from 'svelte/internal/server';
import Box from './Box.svelte';

export default function Slot_fallbacks01_input($$renderer) {
	Box($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2>Hello!</h2> <p>This is a box. It can contain anything.</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Box($$renderer, {});
	$$renderer.push(`<!---->`);
}