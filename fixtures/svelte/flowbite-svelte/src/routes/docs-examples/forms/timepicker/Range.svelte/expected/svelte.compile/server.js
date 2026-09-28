import * as $ from 'svelte/internal/server';
import { Label, Timepicker, P } from "flowbite-svelte";

export default function Range($$renderer) {
	let selectedTimeRange = { time: "09:00", endTime: "17:00" };

	function handleRangeChange(data) {
		if (data) {
			selectedTimeRange = { time: data.time, endTime: data.endTime };
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
		type: 'range',
		onselect: handleRangeChange,
		value: selectedTimeRange.time,
		endValue: selectedTimeRange.endTime,
		divClass: 'shadow-none'
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Selected Range: ${$.escape(selectedTimeRange.time)} - ${$.escape(selectedTimeRange.endTime)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}