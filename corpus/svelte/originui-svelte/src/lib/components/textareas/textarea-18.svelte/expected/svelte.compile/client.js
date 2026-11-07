import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

var root = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Textarea_18($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Read-only textarea');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, {
		get id() {
			return uid;
		},
		class: 'read-only:bg-muted',
		value: 'This is a read-only textarea',
		readonly: true,
		placeholder: 'Leave a comment'
	});

	$.reset(div);
	$.append($$anchor, div);
}