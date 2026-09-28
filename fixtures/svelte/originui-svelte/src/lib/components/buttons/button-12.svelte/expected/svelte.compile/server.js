import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';

export default function Button_12($$renderer) {
	$$renderer.push(`<div class="inline-flex items-center gap-2">`);

	Button($$renderer, {
		variant: 'ghost',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Cancel`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Save`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}