import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<div class="grid w-full gap-2"><!> <!></div>`);

export default function Textarea_with_button($$anchor) {
	var div = root();
	var node = $.child(div);

	Textarea(node, { placeholder: 'Type your message here.' });

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Send message');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}