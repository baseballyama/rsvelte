import * as $ from 'svelte/internal/server';
import { rollup, sum } from 'd3-array';
import { timeDay } from 'd3-time';
import { Area, Chart, ChartGroup, Layer, LineChart } from 'layerchart';
import { randomWalk } from '$lib/utils/data.js';

export default function Facet_brush_overview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const regions = ['North', 'South', 'West'];
		const start = timeDay.offset(new Date(), -90);

		const data = regions.flatMap((region) => {
			const walk = randomWalk({ count: 90 });
			const floor = Math.min(...walk);

			return walk.map((value, i) => ({
				region,
				date: timeDay.offset(start, i),
				value: Math.round(120 + (value - floor) * 12)
			}));
		});

		const totals = Array.from(rollup(data, (rows) => sum(rows, (d) => d.value), (d) => +d.date), ([date, value]) => ({ date: new Date(date), value })).sort((a, b) => +a.date - +b.date);

		{
			function children($$renderer, { group }) {
				const window = group.brush.active ? group.brush.x : undefined;
				const visible = data.filter((d) => group.brush.contains({ x: d.date }));

				$$renderer.push(`<div class="grid gap-2">`);

				LineChart($$renderer, {
					data: visible,
					x: 'date',
					y: 'value',
					fx: 'region',
					fxDomain: regions,
					xDomain: window,
					yDomain: [0, null],
					props: { xAxis: { ticks: 3 } },
					padding: { left: 40, bottom: 24, top: 20 },
					height: 200
				});

				$$renderer.push(`<!----> <div><div class="text-sm text-surface-content/70">All regions — drag to narrow the panels</div> `);

				Chart($$renderer, {
					data: totals,
					x: 'date',
					y: 'value',
					yDomain: [0, null],
					brush: { axis: 'x' },
					padding: { left: 40, bottom: 4 },
					height: 64,
					children: ($$renderer) => {
						Layer($$renderer, {
							children: ($$renderer) => {
								Area($$renderer, {
									line: { class: 'stroke-2 stroke-primary' },
									class: 'fill-primary/20'
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			ChartGroup($$renderer, { children, $$slots: { default: true } });
		}

		$.bind_props($$props, { data });
	});
}