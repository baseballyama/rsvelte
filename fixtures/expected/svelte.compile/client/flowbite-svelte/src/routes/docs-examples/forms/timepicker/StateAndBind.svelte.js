import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Timepicker } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function StateAndBind($$anchor) {
	let selectedTime = $.state("09:00");
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Select Time: ${$.get(selectedTime) ?? ''}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timepicker(node_1, {
		get value() {
			return $.get(selectedTime);
		},

		set value($$value) {
			$.set(selectedTime, $$value, true);
		}
	});

	$.append($$anchor, fragment);
}