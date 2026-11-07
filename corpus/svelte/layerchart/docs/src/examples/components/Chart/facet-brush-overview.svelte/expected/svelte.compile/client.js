import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { rollup, sum } from 'd3-array';
import { timeDay } from 'd3-time';
import { Area, Chart, ChartGroup, Layer, LineChart } from 'layerchart';
import { randomWalk } from '$lib/utils/data.js';

var root = $.from_html(`<div class="grid gap-2"><!> <div><div class="text-sm text-surface-content/70">All regions — drag to narrow the panels</div> <!></div></div>`);

export default function Facet_brush_overview($$anchor, $$props) {
	$.push($$props, true);

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
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let group = () => ($$arg0?.()).group;
			const window = $.derived(() => group().brush.active ? group().brush.x : undefined);
			const visible = $.derived(() => data.filter((d) => group().brush.contains({ x: d.date })));
			var div = root();
			var node = $.child(div);

			LineChart(node, {
				get data() {
					return $.get(visible);
				},
				x: 'date',
				y: 'value',
				fx: 'region',
				get fxDomain() {
					return regions;
				},

				get xDomain() {
					return $.get(window);
				},
				yDomain: [0, null],
				props: { xAxis: { ticks: 3 } },
				padding: { left: 40, bottom: 24, top: 20 },
				height: 200
			});

			var div_1 = $.sibling(node, 2);
			var node_1 = $.sibling($.child(div_1), 2);

			Chart(node_1, {
				get data() {
					return totals;
				},
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				brush: { axis: 'x' },
				padding: { left: 40, bottom: 4 },
				height: 64,
				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Area($$anchor, {
								line: { class: 'stroke-2 stroke-primary' },
								class: 'fill-primary/20'
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		ChartGroup($$anchor, { children, $$slots: { default: true } });
	}

	return $.pop($$exports);
}