import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

var root = $.from_html(`<div class="border-border bg-background z-100 rounded-lg border px-4 py-3 shadow-lg shadow-black/5"><div class="flex flex-col justify-between gap-3 md:flex-row md:items-center"><p class="text-sm">We use cookies to improve your experience, analyze site usage, and show personalized content.</p> <div class="flex gap-2 max-md:flex-wrap"><!> <!></div></div></div>`);

export default function Notification_23($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

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
		variant: 'outline',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Decline');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}