import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<div class="flex w-full max-w-sm items-center gap-2"><!> <!></div>`);

export default function Input_with_button($$anchor) {
	var div = root();
	var node = $.child(div);

	Input(node, { type: 'email', placeholder: 'Email' });

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		type: 'submit',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Subscribe');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}