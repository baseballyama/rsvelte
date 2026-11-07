import * as $ from 'svelte/internal/server';
import { time } from '$lib';
import { SvelteGantt } from 'svelte-gantt/svelte';

export default function TimeRangesExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="example border my-12 svelte-1n4uhxb">`);

		SvelteGantt($$renderer, {
			from: time('8:00'),
			to: time('14:00'),
			minWidth: 400,
			fitWidth: true,
			rows: [{ id: 1 }, { id: 2 }],
			timeRanges: [
				{
					id: 1,
					from: time('8:00'),
					to: time('9:00'),
					classes: null,
					label: 'Breakfast'
				},

				{
					id: 0,
					from: time('10:00'),
					to: time('11:00'),
					classes: 'time-range-lunch',
					label: 'Lunch',
					resizable: false
				},

				{
					id: 2,
					from: time('12:00'),
					to: time('13:00'),
					label: 'Custom class',
					classes: 'gradient'
				}
			]
		});

		$$renderer.push(`<!----></div>`);
	});
}