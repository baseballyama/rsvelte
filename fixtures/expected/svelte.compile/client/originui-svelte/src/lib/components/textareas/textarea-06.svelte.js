import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

var root = $.from_html(`<div class="space-y-2"><!> <!> <p class="text-destructive mt-2 text-xs" role="alert" aria-live="polite">Message should be at least 10 characters</p></div>`);

export default function Textarea_06($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Textarea with error');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, {
		get id() {
			return uid;
		},
		class: 'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/30',
		placeholder: 'Leave a comment',
		value: 'Hello!'
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}