import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Timepicker } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select Time:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timepicker(node_1, {});
	$.append($$anchor, fragment);
}