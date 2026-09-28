import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Download from '@lucide/svelte/icons/download';

export default function Input_20($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with end icon button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex rounded-lg shadow-xs shadow-black/[.04]">`);

	Input($$renderer, {
		id: uid,
		class: '-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10',
		placeholder: 'Email',
		type: 'email'
	});

	$$renderer.push(`<!----> <button class="border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 inline-flex w-9 items-center justify-center rounded-e-lg border text-sm transition-shadow focus:z-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Subscribe">`);
	Download($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></button></div></div>`);
}