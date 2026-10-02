import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div class="items-top flex space-x-2"><!> <div class="grid gap-1.5 leading-none"><!> <p class="text-sm text-muted-foreground">You agree to our Terms of Service and Privacy Policy.</p></div></div>`);

export default function Checkbox_with_text($$anchor) {
	var div = root();
	var node = $.child(div);

	Checkbox(node, { id: 'terms1' });

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Label(node_1, {
		for: 'terms1',
		class: 'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Accept terms and conditions');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}