import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import X from '@lucide/svelte/icons/x';

export default function Notification_10($$renderer) {
	$$renderer.push(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex gap-2"><div class="flex grow gap-3">`);

	CircleCheck($$renderer, {
		class: 'mt-0.5 shrink-0 text-emerald-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!----> <div class="flex grow justify-between gap-12"><p class="text-sm">Message sent</p> <div class="text-sm whitespace-nowrap"><button class="text-sm font-medium hover:underline">View</button> <span class="text-muted-foreground mx-1">·</span> <button class="text-sm font-medium hover:underline">Undo</button></div></div></div> `);

	Button($$renderer, {
		variant: 'ghost',
		class: 'group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent',
		'aria-label': 'Close banner',
		children: ($$renderer) => {
			X($$renderer, {
				size: 16,
				class: 'opacity-60 transition-opacity group-hover:opacity-100',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}