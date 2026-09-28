import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { MenuField, RangeField } from 'svelte-ux';
import { longData } from '$lib/utils/data';
import { fruitColors } from '$lib/utils/fruits';

export default function Labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const placements = [
			{ label: 'Callout', value: 'callout' },
			{ label: 'Centroid', value: 'centroid' },
			{ label: 'Centroid (rotated)', value: 'centroid-rotated' },
			{ label: 'Centroid (radial)', value: 'centroid-radial' },
			{ label: 'Inner', value: 'inner' },
			{ label: 'Middle', value: 'middle' },
			{ label: 'Outer', value: 'outer' }
		];

		let placement = 'callout';
		let offset = 0;
		const data = longData.filter((d) => d.year === 2019);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_1fr] gap-2 mb-4">`);

			MenuField($$renderer, {
				label: 'Placement',
				options: placements,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return placement;
				},

				set value($$value) {
					placement = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Offset',
				min: -40,
				max: 60,
				get value() {
					return offset;
				},

				set value($$value) {
					offset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			PieChart($$renderer, {
				data,
				key: 'fruit',
				value: 'value',
				cRange: fruitColors,
				innerRadius: -40,
				padding: { top: 24, bottom: 24, left: 80, right: 80 },
				labels: {
					placement,
					offset,
					value: 'fruit',
					class: 'text-xs fill-surface-content'
				},
				height: 360
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}