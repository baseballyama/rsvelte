import * as $ from 'svelte/internal/server';
import { Label, Timepicker, P } from "flowbite-svelte";

export default function Select($$renderer) {
	let selectedTimeWithTimezone = { time: "12:00", timezone: "UTC" };

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
			selectedTimeWithTimezone = {
				time: data.time,
				timezone: data.timezone || "UTC" // Fallback to default if not provided
			};
		}
	}

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select Time and Timezone:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Timepicker($$renderer, {
		type: 'select',
		optionLabel: 'Timezone',
		options: timezones,
		onselect: handleTimezoneChange,
		value: selectedTimeWithTimezone.time
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Selected: ${$.escape(selectedTimeWithTimezone.time)} ${$.escape(selectedTimeWithTimezone.timezone)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}