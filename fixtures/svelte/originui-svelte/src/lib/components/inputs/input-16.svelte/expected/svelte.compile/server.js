import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_16($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with inline start and end add-on`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative flex rounded-lg shadow-xs shadow-black/[.04]"><span class="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm">€</span> `);

	Input($$renderer, {
		id: uid,
		class: '-me-px rounded-e-none ps-6 shadow-none',
		placeholder: '0.00',
		type: 'text'
	});

	$$renderer.push(`<!----> <span class="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-e-lg border px-3 text-sm">EUR</span></div></div>`);
}