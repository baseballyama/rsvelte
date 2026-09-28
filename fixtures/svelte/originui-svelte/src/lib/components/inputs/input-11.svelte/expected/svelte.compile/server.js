import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_11($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with start inline add-on`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative">`);

	Input($$renderer, {
		id: uid,
		class: 'peer ps-16',
		placeholder: 'google.com',
		type: 'text'
	});

	$$renderer.push(`<!----> <span class="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">https://</span></div></div>`);
}