import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex gap-2"><div class="flex grow gap-3"><!> <div class="flex grow justify-between gap-12"><p class="text-sm">Message sent</p> <div class="text-sm whitespace-nowrap"><button class="text-sm font-medium hover:underline">View</button> <span class="text-muted-foreground mx-1">·</span> <button class="text-sm font-medium hover:underline">Undo</button></div></div></div> <!></div></div>`);

export default function Notification_10($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	CircleCheck(node, {
		class: 'mt-0.5 shrink-0 text-emerald-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next(2);
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	Button(node_1, {
		variant: 'ghost',
		class: 'group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent',
		'aria-label': 'Close banner',
		children: ($$anchor, $$slotProps) => {
			X($$anchor, {
				size: 16,
				class: 'opacity-60 transition-opacity group-hover:opacity-100',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}