import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

export default function Linechart_tickspacing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
		let tickSpacing = true;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<label class="flex gap-2 pb-4 screenshot-hidden">`);

			Switch($$renderer, {
				get checked() {
					return tickSpacing;
				},

				set checked($$value) {
					tickSpacing = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(tickSpacing ? 'Applying tickSpacing' : 'Not applying tickSpacing')}</label> `);

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				props: { xAxis: { tickSpacing: tickSpacing ? 200 : undefined } },
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