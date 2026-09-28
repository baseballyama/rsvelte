import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div><div class="flex items-center space-x-2"><!> <!></div></div>`);

export default function Label_demo($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Checkbox(node, { id: 'terms' });

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		for: 'terms',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Accept terms and conditions');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}