import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"><div class="flex gap-2"><div class="flex grow gap-3"><!> <div class="flex grow flex-col gap-3"><div class="space-y-1"><p class="text-sm font-medium">Your request was completed!</p> <p class="text-muted-foreground text-sm">It demonstrates that the task or request has been processed.</p></div> <div class="flex gap-2"><!></div></div> <!></div></div></div>`);

export default function Notification_13($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	CircleCheck(node, {
		class: 'mt-0.5 shrink-0 text-emerald-500',
		size: 16,
		'aria-hidden': 'true'
	});

	var div_3 = $.sibling(node, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_1 = $.child(div_4);

	Button(node_1, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Learn more');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	Button(node_2, {
		variant: 'ghost',
		class: 'group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent',
		'aria-label': 'Close notification',
		children: ($$anchor, $$slotProps) => {
			X($$anchor, {
				size: 16,
				class: 'opacity-60 transition-opacity group-hover:opacity-100',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}