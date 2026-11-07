import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Info from '@lucide/svelte/icons/info';
import X from '@lucide/svelte/icons/x';

export default function Notification_14($$renderer) {
	$$renderer.push(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"><div class="flex gap-2"><div class="flex grow gap-3">`);

	Info($$renderer, {
		class: 'mt-0.5 shrink-0 text-blue-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!----> <div class="flex grow flex-col gap-3"><div class="space-y-1"><p class="text-sm font-medium">Here is some helpful information!</p> <p class="text-muted-foreground text-sm">It aims to provide clarity or support for better decision-making.</p></div> <div class="flex gap-2">`);

	Button($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Learn more`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> `);

	Button($$renderer, {
		variant: 'ghost',
		class: 'group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent',
		'aria-label': 'Close notification',
		children: ($$renderer) => {
			X($$renderer, {
				size: 16,
				class: 'opacity-60 transition-opacity group-hover:opacity-100',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}