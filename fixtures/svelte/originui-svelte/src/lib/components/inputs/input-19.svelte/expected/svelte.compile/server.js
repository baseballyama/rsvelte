import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Send from '@lucide/svelte/icons/send';

export default function Input_19($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with end inline button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative">`);
	Input($$renderer, { id: uid, class: 'pe-9', placeholder: 'Email', type: 'email' });
	$$renderer.push(`<!----> <button class="text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Subscribe">`);
	Send($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></button></div></div>`);
}