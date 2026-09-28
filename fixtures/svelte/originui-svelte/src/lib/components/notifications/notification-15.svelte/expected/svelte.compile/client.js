import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"><div class="flex gap-2"><div class="flex grow flex-col gap-3"><div class="space-y-1"><p class="text-sm font-medium">We Value Your Privacy 🍪</p> <p class="text-muted-foreground text-sm">We use cookies to improve your experience, and show personalized content.</p></div> <div class="flex gap-2"><!> <!></div></div> <!></div></div>`);

export default function Notification_15($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var node = $.child(div_3);

	Button(node, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Accept');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		size: 'sm',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Decline');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

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