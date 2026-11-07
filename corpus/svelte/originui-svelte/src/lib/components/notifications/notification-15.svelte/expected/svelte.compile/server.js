import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import X from '@lucide/svelte/icons/x';

export default function Notification_15($$renderer) {
	$$renderer.push(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"><div class="flex gap-2"><div class="flex grow flex-col gap-3"><div class="space-y-1"><p class="text-sm font-medium">We Value Your Privacy 🍪</p> <p class="text-muted-foreground text-sm">We use cookies to improve your experience, and show personalized content.</p></div> <div class="flex gap-2">`);

	Button($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'sm',
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Decline`);
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

	$$renderer.push(`<!----></div></div>`);
}