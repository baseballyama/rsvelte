import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { timeDay } from 'd3-time';
import { randomWalk } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

export default function Tooltip_external($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const now = new Date();
		const data = randomWalk({ count: 1000 }).map((value, i) => ({ date: timeDay.offset(now, i), value: 10 + value }));
		let context = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-sm">`);

			if (context && context.tooltip.data) {
				$$renderer.push(`<!--[0-->date: ${$.escape(format(context.tooltip.data.date, 'day', { variant: 'short' }))}
		value: ${$.escape(format(context.tooltip.data.value, 'decimal'))}`);
			} else {
				$$renderer.push(`<!--[-1-->[hover chart]`);
			}

			$$renderer.push(`<!--]--></div> `);

			AreaChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				padding: defaultChartPadding({ top: 10 }),
				height: 300,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				}
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