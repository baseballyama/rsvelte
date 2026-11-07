import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

var root = $.from_html(`<div class="space-y-2"><!> <!> <div class="flex justify-end"><!></div></div>`);

export default function Textarea_11($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Textarea with right button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, {
		get id() {
			return uid;
		},
		placeholder: 'Leave a comment'
	});

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	Button(node_2, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Send');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}