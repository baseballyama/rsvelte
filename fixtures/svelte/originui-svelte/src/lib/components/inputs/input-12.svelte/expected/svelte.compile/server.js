import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_12($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with end inline add-on`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative">`);

	Input($$renderer, {
		id: uid,
		class: 'peer pe-12',
		placeholder: 'google',
		type: 'text'
	});

	$$renderer.push(`<!----> <span class="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">.com</span></div></div>`);
}