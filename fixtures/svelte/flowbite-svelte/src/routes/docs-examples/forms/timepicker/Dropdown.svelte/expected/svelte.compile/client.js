import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Timepicker, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Dropdown($$anchor) {
	let selectedTime = $.state($.proxy({ time: "12:00", duration: "30" }));

	const durations = [
		{ value: "30", name: "30 minutes" },
		{ value: "60", name: "1 hour" },
		{ value: "120", name: "2 hours" }
	];

	function handleChange(data) {
		if (data) {
			$.set(selectedTime, { time: data.time, duration: data.duration || "30" }, true);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select Time and Duration:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timepicker(node_1, {
		type: 'dropdown',
		optionLabel: 'Duration',
		get options() {
			return durations;
		},
		onselect: handleChange,
		get value() {
			return $.get(selectedTime).time;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `Selected: ${$.get(selectedTime).time ?? ''}, Duration: ${$.get(selectedTime).duration ?? ''}`));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}