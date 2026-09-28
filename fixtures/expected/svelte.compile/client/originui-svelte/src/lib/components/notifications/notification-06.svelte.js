import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import CircleAlert from '@lucide/svelte/icons/circle-alert';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex gap-2"><div class="flex grow gap-3"><!> <div class="flex grow justify-between gap-12"><p class="text-sm">An error occurred!</p> <a href="#title" class="group text-sm font-medium whitespace-nowrap">Link<!></a></div></div> <!></div></div>`);

export default function Notification_06($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	CircleAlert(node, {
		class: 'mt-0.5 shrink-0 text-red-500',
		size: 16,
		'aria-hidden': 'true'
	});

	var div_3 = $.sibling(node, 2);
	var a = $.sibling($.child(div_3), 2);
	var node_1 = $.sibling($.child(a));

	ArrowRight(node_1, {
		class: 'ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5',
		size: 16,
		'aria-hidden': 'true'
	});

	$.reset(a);
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