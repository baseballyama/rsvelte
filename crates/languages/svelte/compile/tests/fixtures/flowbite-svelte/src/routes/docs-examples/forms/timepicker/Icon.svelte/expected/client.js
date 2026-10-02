import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Timepicker } from "flowbite-svelte";
import { ClockOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Icon($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select Time (Flowbite Icon):');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timepicker(node_1, {
		get Icon() {
			return ClockOutline;
		},
		iconClass: 'text-red-500'
	});

	var node_2 = $.sibling(node_1, 2);

	Label(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Select Time (Default icon):');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Timepicker(node_3, {});
	$.append($$anchor, fragment);
}