import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, ScaledSvg, Html, flatten } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import MultiLine from '../../_components/MultiLine.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import GroupLabels from '../../_components/GroupLabels.html.svelte';
import SharedTooltip from '../../_components/SharedTooltip.percent-range.html.svelte';
import data from '../../_data/fruit.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="chart-container svelte-10xuix7"><!></div>`);

export default function MultiLine_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	/* --------------------------------------------
	 * Set what is our x key to separate it from the other series
	 */
	const xKey = 'month';

	const yKey = 'value';
	const zKey = 'fruit';
	const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
	const seriesColors = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc'];
	const parseDate = timeParse('%Y-%m-%d');

	/* --------------------------------------------
	 * Create a "long" format that is a grouped series of data points
	 * Layer Cake uses this data structure and the key names
	 * set in xKey, yKey and zKey to map your data into each scale.
	 */
	const dataLong = seriesNames.map((key) => {
		return {
			[zKey]: key,
			values: data.map((d) => {
				// Put this in a conditional so that we don't recast the data on second render
				d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];

				return { [yKey]: +d[key], [xKey]: d[xKey], [zKey]: key };
			})
		};
	});

	const formatLabelX = timeFormat('%b. %e');
	const formatLabelY = (d) => format(`~s`)(d);
	var div = root_2();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => flatten(dataLong, 'values'));

		LayerCake(node, {
			ssr: true,
			percentRange: true,
			padding: { top: 7, right: 10, bottom: 20, left: 25 },
			x: xKey,
			y: yKey,
			z: zKey,
			get zScale() {
				return $.get($0);
			},

			get zRange() {
				return seriesColors;
			},

			get flatData() {
				return $.get($1);
			},
			yDomain: [0, null],
			get data() {
				return dataLong;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				Html(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						{
							let $0 = $.derived(() => data.map((d) => d[xKey]).sort((a, b) => a - b));

							AxisX(node_2, {
								gridlines: false,
								get ticks() {
									return $.get($0);
								},

								get format() {
									return formatLabelX;
								},
								snapLabels: true,
								tickMarks: true
							});
						}

						var node_3 = $.sibling(node_2, 2);

						AxisY(node_3, { format: formatLabelY });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_1, 2);

				ScaledSvg(node_4, {
					children: ($$anchor, $$slotProps) => {
						MultiLine($$anchor, {});
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Html(node_5, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_6 = $.first_child(fragment_3);

						GroupLabels(node_6, {});

						var node_7 = $.sibling(node_6, 2);

						SharedTooltip(node_7, {
							get formatTitle() {
								return formatLabelX;
							},

							get dataset() {
								return data;
							}
						});

						$.append($$anchor, fragment_3);
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