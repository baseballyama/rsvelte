import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Radio from '@lucide/svelte/icons/radio';
import X from '@lucide/svelte/icons/x';

export default function Notification_18($$renderer) {
	$$renderer.push(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"><div class="flex items-center gap-2"><div class="border-border flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">`);
	Radio($$renderer, { class: 'opacity-60', size: 16 });
	$$renderer.push(`<!----></div> <div class="flex grow items-center gap-12"><div class="space-y-1"><p class="text-sm font-medium">Live in 27 hours</p> <p class="text-muted-foreground text-xs">November 20 at 8:00 PM.</p></div> `);

	Button($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Notify me`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

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