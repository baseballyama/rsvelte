import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Inline2($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Checkbox(node, {
		inline: true,
		classes: { div: "me-2" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Inline 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		inline: true,
		classes: { div: "me-2" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Inline 2');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Checkbox(node_2, {
		inline: true,
		classes: { div: "me-2" },
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
		inline: true,
		classes: { div: "me-2" },
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Inline disabled');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}