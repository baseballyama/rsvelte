import * as $ from 'svelte/internal/server';
import { Label, Timepicker, P } from "flowbite-svelte";

export default function Timerange($$renderer) {
	let selectedTimerangeDropdown = { time: "09:00", endTime: "17:00" };

	function handleTimerangeDropdownChange(data) {
		if (data) {
			selectedTimerangeDropdown = { time: data.time, endTime: data.endTime };
		}
	}

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select Time Range:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Timepicker($$renderer, {
		type: 'timerange-dropdown',
		onselect: handleTimerangeDropdownChange,
		value: selectedTimerangeDropdown.time,
		endValue: selectedTimerangeDropdown.endTime
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Selected Range: ${$.escape(selectedTimerangeDropdown.time)} - ${$.escape(selectedTimerangeDropdown.endTime)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}