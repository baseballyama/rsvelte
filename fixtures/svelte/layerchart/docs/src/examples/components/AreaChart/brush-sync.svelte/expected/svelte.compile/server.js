import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { randomWalk } from '$lib/utils/data.js';
import { timeDay } from 'd3-time';

export default function Brush_sync($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const now = new Date();
		const data1 = randomWalk({ count: 1000 }).map((value, i) => ({ date: timeDay.offset(now, i), value: 10 + value }));
		const data2 = randomWalk({ count: 1000 }).map((value, i) => ({ date: timeDay.offset(now, i), value: 10 + value }));
		const data = $.derived(() => ({ data: { data1, data2 } }));
		let xDomain = void 0;

		$$renderer.push(`<div class="grid xl:grid-cols-2 gap-3"><div class="p-4 border rounded-sm">`);

		AreaChart($$renderer, {
			data: data1,
			x: 'date',
			y: 'value',
			xDomain,
			brush: {
				onBrushEnd: (e) => {
					xDomain = e.brush.x;
					e.brush.reset();
				}
			},
			motion: { type: 'spring' },
			props: { xAxis: { tickMultiline: true } },
			padding: defaultChartPadding({ bottom: 30 }),
			height: 300
		});

		$$renderer.push(`<!----></div> <div class="p-4 border rounded-sm">`);

		AreaChart($$renderer, {
			data: data2,
			x: 'date',
			y: 'value',
			xDomain,
			brush: {
				onBrushEnd: (e) => {
					xDomain = e.brush.x;
					e.brush.reset();
				}
			},
			motion: { type: 'spring' },
			props: { xAxis: { tickMultiline: true } },
			padding: defaultChartPadding({ bottom: 30 }),
			height: 300
		});

		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { data });
	});
}