import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "$lib/registry/ui/label/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<div class="grid w-full gap-1.5"><!> <!> <p class="text-sm text-muted-foreground">Your message will be copied to the support team.</p></div>`);

export default function Textarea_with_text($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		for: 'message-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your Message');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, { placeholder: 'Type your message here.', id: 'message-2' });
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}