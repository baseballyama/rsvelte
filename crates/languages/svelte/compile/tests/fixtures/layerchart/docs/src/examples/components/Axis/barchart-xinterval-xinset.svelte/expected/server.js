import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { timeDay } from 'd3-time';
import { createDateSeries } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

export default function Barchart_xinterval_xinset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = $.derived(() => createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }));
		let xInterval = true;
		let xInset = true;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex justify-between pb-4 screenshot-hidden"><label class="flex gap-2">`);

			Switch($$renderer, {
				get checked() {
					return xInterval;
				},

				set checked($$value) {
					xInterval = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(xInterval
				? 'Applying xInterval={timeDay}'
				: 'Not applying xInterval={timeDay}')}</label> <label class="flex gap-2">`);

			Switch($$renderer, {
				get checked() {
					return xInset;
				},

				set checked($$value) {
					xInset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(xInset ? 'Applying xInset' : 'Not applying xInset')}</label></div> `);

			BarChart($$renderer, {
				data: data(),
				x: 'date',
				y: 'value',
				props: {
					xAxis: { tickSpacing: 200 },
					bars: { insets: { x: xInset ? 4 : undefined } }
				},
				xInterval: xInterval ? timeDay : undefined,
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