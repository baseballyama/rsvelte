import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Timepicker, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Select($$anchor) {
	let selectedTimeWithTimezone = $.state($.proxy({ time: "12:00", timezone: "UTC" }));

	const timezones = [
		{ value: "UTC", name: "UTC" },
		{ value: "EST", name: "Eastern Time (EST)" },
		{ value: "CST", name: "Central Time (CST)" },
		{ value: "MST", name: "Mountain Time (MST)" },
		{ value: "PST", name: "Pacific Time (PST)" },
		{ value: "GMT", name: "Greenwich Mean Time (GMT)" },
		{ value: "CET", name: "Central European Time (CET)" }
	];

	function handleTimezoneChange(data) {
		if (data) {
			// Extract the timezone from the "timezone" key in the data object
			$.set(
				selectedTimeWithTimezone,
				{
					time: data.time,
					timezone: data.timezone || "UTC" // Fallback to default if not provided
				},
				true
			);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select Time and Timezone:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timepicker(node_1, {
		type: 'select',
		optionLabel: 'Timezone',
		get options() {
			return timezones;
		},
		onselect: handleTimezoneChange,
		get value() {
			return $.get(selectedTimeWithTimezone).time;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `Selected: ${$.get(selectedTimeWithTimezone).time ?? ''} ${$.get(selectedTimeWithTimezone).timezone ?? ''}`));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}