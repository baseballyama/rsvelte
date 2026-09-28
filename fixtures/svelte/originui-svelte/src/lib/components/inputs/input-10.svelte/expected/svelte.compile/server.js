import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Mail from '@lucide/svelte/icons/mail';

export default function Input_10($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with end icon`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative">`);

	Input($$renderer, {
		id: uid,
		class: 'peer pe-9',
		placeholder: 'Email',
		type: 'email'
	});

	$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">`);
	Mail($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></div></div></div>`);
}