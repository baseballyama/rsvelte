import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "flowbite-svelte";

var root = $.from_html(`<div class="rounded-sm border border-gray-200 dark:border-gray-700"><!></div> <div class="rounded-sm border border-gray-200 dark:border-gray-700"><!></div>`, 1);

export default function Bordered($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Checkbox(node, {
		classes: { div: "w-full p-4" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default radio');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Checkbox(node_1, {
		checked: true,
		classes: { div: "w-full p-4" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Checked state');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}