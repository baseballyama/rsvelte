import * as $ from 'svelte/internal/server';
import { Label, Timepicker, P } from "flowbite-svelte";

export default function Dropdown($$renderer) {
	let selectedTime = { time: "12:00", duration: "30" };

	const durations = [
		{ value: "30", name: "30 minutes" },
		{ value: "60", name: "1 hour" },
		{ value: "120", name: "2 hours" }
	];

	function handleChange(data) {
		if (data) {
			selectedTime = { time: data.time, duration: data.duration || "30" };
		}
	}

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select Time and Duration:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Timepicker($$renderer, {
		type: 'dropdown',
		optionLabel: 'Duration',
		options: durations,
		onselect: handleChange,
		value: selectedTime.time
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Selected: ${$.escape(selectedTime.time)}, Duration: ${$.escape(selectedTime.duration)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}