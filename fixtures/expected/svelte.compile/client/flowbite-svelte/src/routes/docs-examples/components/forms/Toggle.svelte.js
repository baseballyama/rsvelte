import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Toggle_1($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Toggle(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toggle me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Toggle(node_1, {
		checked: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Checked toggle');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Toggle(node_2, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Disabled toggle');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Toggle(node_3, {
		checked: true,
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Disabled checked');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}