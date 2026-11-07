import * as $ from 'svelte/internal/server';
import { Spinner, Button } from "flowbite-svelte";

export default function Buttons($$renderer) {
	$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

	Button($$renderer, {
		children: ($$renderer) => {
			Spinner($$renderer, { class: 'me-3', size: '4', color: 'blue' });
			$$renderer.push(`<!----> Loading ...`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		outline: true,
		color: 'gray',
		children: ($$renderer) => {
			Spinner($$renderer, { class: 'me-3', size: '4' });
			$$renderer.push(`<!----> Loading ...`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}