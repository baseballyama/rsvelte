import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd } from "flowbite-svelte";

var root = $.from_html(`<p class="text-gray-500 dark:text-gray-400">Please press <!> + <!> + <!> to re-render an MDN page.</p>`);

export default function Text($$anchor) {
	var p = root();
	var node = $.sibling($.child(p));

	Kbd(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Ctrl');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Kbd(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Shift');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Kbd(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('R');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(p);
	$.append($$anchor, p);
}