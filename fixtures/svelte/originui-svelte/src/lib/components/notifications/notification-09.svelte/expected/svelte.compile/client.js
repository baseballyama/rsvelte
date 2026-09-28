import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex items-center gap-2"><div class="flex grow items-center gap-3"><!> <div class="flex grow items-center justify-between gap-12"><p class="text-sm">You&lsquo;ve made changes!</p> <!></div></div> <!></div></div>`);

export default function Notification_09($$anchor) {
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
	var node_1 = $.sibling($.child(div_3), 2);

	Button(node_1, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Undo');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	Button(node_2, {
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