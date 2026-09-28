import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);

export default function Checkbox_disabled($$anchor) {
	var div = root();
	var node = $.child(div);

	Checkbox(node, { id: 'terms', disabled: true });

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		for: 'terms2',
		class: 'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-data-[disabled=true]:cursor-not-allowed peer-data-[disabled=true]:opacity-70',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Accept terms and conditions');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}