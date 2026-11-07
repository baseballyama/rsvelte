import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);

export default function Switch_demo($$anchor) {
	var div = root();
	var node = $.child(div);

	Switch(node, { id: 'airplane-mode' });

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		for: 'airplane-mode',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Airplane Mode');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}