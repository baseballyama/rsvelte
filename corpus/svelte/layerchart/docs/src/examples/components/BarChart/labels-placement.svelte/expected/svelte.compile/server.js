import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { MenuField } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

export default function Labels_placement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const placements = [
			{ label: 'Inside', value: 'inside' },
			{ label: 'Outside', value: 'outside' },
			{ label: 'Middle', value: 'middle' },
			{ label: 'Center', value: 'center' }
		];

		let placement = 'outside';

		const data = createDateSeries({
			count: 10,
			min: -20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MenuField($$renderer, {
				label: 'Placement',
				options: placements,
				stepper: true,
				classes: { root: 'mb-4', menuIcon: 'hidden' },
				get value() {
					return placement;
				},

				set value($$value) {
					placement = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			BarChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				labels: { placement },
				yPadding: [20, 20],
				height: 300
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