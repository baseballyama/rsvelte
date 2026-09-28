import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_04($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="[*:not(:first-child)]:mt-2"><div class="mb-2 flex justify-between gap-1">`);

	Label($$renderer, {
		for: uid,
		class: 'leading-6',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with hint`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">Optional</span></div> `);
	Input($$renderer, { id: uid, placeholder: 'Email', type: 'email' });
	$$renderer.push(`<!----></div>`);
}