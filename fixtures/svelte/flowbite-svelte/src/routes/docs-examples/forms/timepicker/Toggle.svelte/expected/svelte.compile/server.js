import * as $ from 'svelte/internal/server';
import { Label, Timepicker, P } from "flowbite-svelte";

export default function Toggle($$renderer) {
	let selectedTimerangeToggle = { time: "09:00", endTime: "17:00" };

	function handleTimerangeToggleChange(data) {
		if (data) {
			selectedTimerangeToggle = { time: data.time, endTime: data.endTime };
		}
	}

	Label($$renderer, {
		class: 'mb-2',
		for: 'timerange-toggle',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Toggle Time Range:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Timepicker($$renderer, {
		type: 'timerange-toggle',
		onselect: handleTimerangeToggleChange,
		value: selectedTimerangeToggle.time,
		endValue: selectedTimerangeToggle.endTime,
		divClass: 'shadow-none'
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Selected Range: ${$.escape(selectedTimerangeToggle.time)} - ${$.escape(selectedTimerangeToggle.endTime)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}