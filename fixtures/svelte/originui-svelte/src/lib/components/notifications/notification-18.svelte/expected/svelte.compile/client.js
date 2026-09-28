import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Radio from '@lucide/svelte/icons/radio';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"><div class="flex items-center gap-2"><div class="border-border flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><!></div> <div class="flex grow items-center gap-12"><div class="space-y-1"><p class="text-sm font-medium">Live in 27 hours</p> <p class="text-muted-foreground text-xs">November 20 at 8:00 PM.</p></div> <!></div> <!></div></div>`);

export default function Notification_18($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Radio(node, { class: 'opacity-60', size: 16 });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.sibling($.child(div_3), 2);

	Button(node_1, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Notify me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

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

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}