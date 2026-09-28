import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html, flatten } from 'layercake';
import { stack } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import { timeParse, timeFormat } from 'd3-time-format';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import AreaStacked from '../../_components/AreaStacked.svelte';
import data from '../../_data/fruit.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-1eqhjxm"><!></div>`);

export default function AreaStacked_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'month';

	const yKey = [0, 1];
	const zKey = 'key';
	const parseDate = timeParse('%Y-%m-%d');
	const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
	const seriesColors = ['#ff00cc', '#ff7ac7', '#ffb3c0', '#ffe4b8'];

	data.forEach((d) => {
		d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];
	});

	/* --------------------------------------------
	 * Create a stacked data structure
	 */
	const stackData = stack().keys(seriesNames);

	const series = stackData(data);
	const formatLabelX = timeFormat('%b. %-d');
	const formatLabelY = (d) => format(`~s`)(d);
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => flatten(series));

		LayerCake(node, {
			ssr: true,
			percentRange: true,
			padding: { top: 0, right: 0, bottom: 20, left: 17 },
			x: (d) => d.data[xKey],
			get y() {
				return yKey;
			},
			z: zKey,
			get zScale() {
				return $.get($0);
			},

			get zDomain() {
				return seriesNames;
			},

			get zRange() {
				return seriesColors;
			},

			get flatData() {
				return $.get($1);
			},

			get data() {
				return series;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Html(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						AxisX(node_2, {
							get format() {
								return formatLabelX;
							},
							tickMarks: true
						});

						var node_3 = $.sibling(node_2, 2);

						AxisY(node_3, { format: formatLabelY });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_1, 2);

				ScaledSvg(node_4, {
					children: ($$anchor, $$slotProps) => {
						AreaStacked($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}