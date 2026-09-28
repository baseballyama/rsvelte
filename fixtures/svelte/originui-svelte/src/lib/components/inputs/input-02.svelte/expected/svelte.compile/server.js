import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_02($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Required input <span class="text-destructive">*</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: uid, placeholder: 'Email', type: 'email', required: true });
	$$renderer.push(`<!----></div>`);
}