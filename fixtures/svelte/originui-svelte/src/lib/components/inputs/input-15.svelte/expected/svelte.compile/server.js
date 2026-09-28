import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_15($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with end add-on`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex rounded-lg shadow-xs shadow-black/[.04]">`);

	Input($$renderer, {
		id: uid,
		class: 'z-10 -me-px rounded-e-none shadow-none',
		placeholder: 'google',
		type: 'text'
	});

	$$renderer.push(`<!----> <span class="border-input bg-background text-muted-foreground inline-flex items-center rounded-e-lg border px-3 text-sm">.com</span></div></div>`);
}