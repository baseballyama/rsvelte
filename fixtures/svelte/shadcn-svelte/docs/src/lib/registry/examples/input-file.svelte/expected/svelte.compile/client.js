import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div class="grid w-full max-w-sm items-center gap-1.5"><!> <!></div>`);

export default function Input_file($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		for: 'picture',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Picture');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, { id: 'picture', type: 'file' });
	$.reset(div);
	$.append($$anchor, div);
}