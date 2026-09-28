import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Timepicker } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function CustomProps($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		for: 'appointment-time',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Choose appointment time:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timepicker(node_1, {
		id: 'appointment-time',
		value: '09:00',
		min: '08:00',
		max: '18:00'
	});

	$.append($$anchor, fragment);
}