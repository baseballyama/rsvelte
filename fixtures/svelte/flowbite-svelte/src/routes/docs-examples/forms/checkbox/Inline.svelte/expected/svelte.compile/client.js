import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "flowbite-svelte";

var root = $.from_html(`<div class="flex gap-3"><!> <!> <!> <!></div>`);

export default function Inline($$anchor) {
	var div = root();
	var node = $.child(div);

	Checkbox(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Inline 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Inline 2');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Checkbox(node_2, {
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Inline checked');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Checkbox(node_3, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Inline disabled');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}