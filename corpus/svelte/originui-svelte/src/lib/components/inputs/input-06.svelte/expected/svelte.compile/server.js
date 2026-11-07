import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_06($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with error`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		id: uid,
		class: 'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/30',
		placeholder: 'Email',
		type: 'email',
		value: 'invalid@email.com'
	});

	$$renderer.push(`<!----> <p class="text-destructive text-xs" role="alert" aria-live="polite">Email is invalid</p></div>`);
}