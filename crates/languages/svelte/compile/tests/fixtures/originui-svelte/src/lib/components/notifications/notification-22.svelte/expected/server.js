import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import X from '@lucide/svelte/icons/x';
import { toast } from 'svelte-sonner';

function customToastSnippet($$renderer, toastId) {
	$$renderer.push(`<div class="border-border bg-background w-(--width) rounded-lg border px-4 py-3"><div class="flex gap-2"><div class="flex grow gap-3">`);

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
		onclick: () => toast.dismiss(toastId),
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

export default function Notification_22($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function openToast() {
			const newId = Math.random();

			//the implementation will change, once https://github.com/wobsoriano/svelte-sonner/pull/126 lands
			//@ts-expect-error - this is a hack to get the toast id, dont use in production
			toast.custom((node) => customToastSnippet(node, () => newId), { id: newId });
		}

		Button($$renderer, {
			variant: 'outline',
			onclick: () => openToast(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Custom sonner`);
			},
			$$slots: { default: true }
		});
	});
}