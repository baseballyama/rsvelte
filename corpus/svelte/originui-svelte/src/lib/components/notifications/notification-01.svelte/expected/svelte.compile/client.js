import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex gap-2"><p class="grow text-sm"><!>Some information is missing!</p> <!></div></div>`);

export default function Notification_01($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var node = $.child(p);

	TriangleAlert(node, {
		class: 'me-3 -mt-0.5 inline-flex text-amber-500',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next();
	$.reset(p);

	var node_1 = $.sibling(p, 2);

	Button(node_1, {
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

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}