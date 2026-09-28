import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Info from '@lucide/svelte/icons/info';
import X from '@lucide/svelte/icons/x';

export default function Notification_04($$renderer) {
	$$renderer.push(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex gap-2"><p class="grow text-sm">`);

	Info($$renderer, {
		class: 'me-3 -mt-0.5 inline-flex text-blue-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!---->Just a
			quick note!</p> `);

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

	$$renderer.push(`<!----></div></div>`);
}