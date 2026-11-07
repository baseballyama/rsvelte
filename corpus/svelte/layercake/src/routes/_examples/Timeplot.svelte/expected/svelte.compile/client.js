import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, calcExtents } from 'layercake';
import { timeDay } from 'd3-time';
import { scaleBand, scaleTime } from 'd3-scale';
import ScatterSvg from '../../_components/Scatter.svg.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/days.csv';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-wj9rpl"><!></div>`);

export default function Timeplot($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'seconds';

	const yKey = 'day';
	const r = 4;

	const daysTransformed = data.map((d) => {
		const parts = d.timestring.split('T');
		const time = parts[1].replace('Z', '').split(':').map((q) => +q);

		d[xKey] = time[0] * 60 * 60 + time[1] * 60 + time[2];
		d[yKey] = parts[0];

		return d;
	});

	/* --------------------------------------------
	 * Generate a range of days in between the min and max
	 * in case we are missing any in our data so we can show empty days for them
	 */
	const extents = calcExtents(daysTransformed, { x: (d) => d.timestring });

	// Convert to string even though it is one to make Typescript happy
	const minDate = extents.x[0].toString().split('T')[0].split('-').map((d) => +d);

	const maxDate = extents.x[1].toString().split('T')[0].split('-').map((d) => +d);
	const allDays = timeDay.range(new Date(Date.UTC(minDate[0], minDate[1] - 1, minDate[2])), new Date(Date.UTC(maxDate[0], maxDate[1] - 1, maxDate[2] + 1))).map((d) => d.toISOString().split('T')[0]).sort();
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleTime);
		let $1 = $.derived(() => scaleBand().paddingInner(0.05).round(true));

		LayerCake(node, {
			padding: { top: 0, right: 15, bottom: 20, left: 75 },
			x: xKey,
			y: yKey,
			xDomain: [0, 24 * 60 * 60],
			get yDomain() {
				return allDays;
			},

			get xScale() {
				return $.get($0);
			},

			get yScale() {
				return $.get($1);
			},

			get data() {
				return daysTransformed;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							let $0 = $.derived(() => [0, 4, 8, 12, 16, 20, 24].map((d) => d * 60 * 60));

							AxisX(node_1, {
								get ticks() {
									return $.get($0);
								},
								format: (d) => `${Math.floor(d / 60 / 60)}:00`
							});
						}

						var node_2 = $.sibling(node_1, 2);

						AxisY(node_2, {});

						var node_3 = $.sibling(node_2, 2);

						ScatterSvg(node_3, { r, fill: 'rgba(255, 204, 0, 0.75)' });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}