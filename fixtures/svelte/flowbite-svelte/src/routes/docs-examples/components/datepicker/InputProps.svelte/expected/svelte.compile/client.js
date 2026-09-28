import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Datepicker } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function InputProps($$anchor) {
	let selectedDate = $.state(undefined);
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		class: 'mb-2 flex items-center font-bold italic',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('My Datepicker');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Datepicker(node_1, {
		inputProps: { id: "my-datepicker" },
		get value() {
			return $.get(selectedDate);
		},

		set value($$value) {
			$.set(selectedDate, $$value, true);
		}
	});

	$.append($$anchor, fragment);
}