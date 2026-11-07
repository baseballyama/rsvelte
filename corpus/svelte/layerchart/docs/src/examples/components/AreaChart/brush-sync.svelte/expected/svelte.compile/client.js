import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { randomWalk } from '$lib/utils/data.js';
import { timeDay } from 'd3-time';

var root = $.from_html(`<div class="grid xl:grid-cols-2 gap-3"><div class="p-4 border rounded-sm"><!></div> <div class="p-4 border rounded-sm"><!></div></div>`);

export default function Brush_sync($$anchor, $$props) {
	$.push($$props, true);

	const now = new Date();
	const data1 = randomWalk({ count: 1000 }).map((value, i) => ({ date: timeDay.offset(now, i), value: 10 + value }));
	const data2 = randomWalk({ count: 1000 }).map((value, i) => ({ date: timeDay.offset(now, i), value: 10 + value }));
	const data = $.derived(() => ({ data: { data1, data2 } }));
	let xDomain = $.state(void 0);

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => defaultChartPadding({ bottom: 30 }));

		AreaChart(node, {
			get data() {
				return data1;
			},
			x: 'date',
			y: 'value',
			get xDomain() {
				return $.get(xDomain);
			},

			brush: {
				onBrushEnd: (e) => {
					$.set(xDomain, e.brush.x, true);
					e.brush.reset();
				}
			},
			motion: { type: 'spring' },
			props: { xAxis: { tickMultiline: true } },
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		let $0 = $.derived(() => defaultChartPadding({ bottom: 30 }));

		AreaChart(node_1, {
			get data() {
				return data2;
			},
			x: 'date',
			y: 'value',
			get xDomain() {
				return $.get(xDomain);
			},

			brush: {
				onBrushEnd: (e) => {
					$.set(xDomain, e.brush.x, true);
					e.brush.reset();
				}
			},
			motion: { type: 'spring' },
			props: { xAxis: { tickMultiline: true } },
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}