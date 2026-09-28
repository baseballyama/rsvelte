import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_25($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Search input with &lt;kbd>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative">`);

	Input($$renderer, {
		id: uid,
		class: 'pe-11',
		placeholder: 'Search...',
		type: 'search'
	});

	$$renderer.push(`<!----> <div class="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2"><kbd class="border-border text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘K</kbd></div></div></div>`);
}