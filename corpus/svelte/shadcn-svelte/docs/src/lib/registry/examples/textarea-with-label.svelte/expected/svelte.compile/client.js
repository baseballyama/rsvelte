import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "$lib/registry/ui/label/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<div class="grid w-full gap-1.5"><!> <!></div>`);

export default function Textarea_with_label($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		for: 'message',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your message');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, { placeholder: 'Type your message here.', id: 'message' });
	$.reset(div);
	$.append($$anchor, div);
}