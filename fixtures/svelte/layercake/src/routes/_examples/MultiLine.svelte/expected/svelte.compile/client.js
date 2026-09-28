import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html, groupLonger, flatten } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import MultiLine from '../../_components/MultiLine.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import Labels from '../../_components/GroupLabels.html.svelte';
import SharedTooltip from '../../_components/SharedTooltip.html.svelte';
import data from '../../_data/fruit.csv';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="chart-container svelte-1qgrk18"><!></div>`);

export default function MultiLine_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	/* --------------------------------------------
	 * Set what is our x key to separate it from the other series
	 */
	const xKey = 'month';

	const yKey = 'value';
	const zKey = 'fruit';
	const xKeyCast = timeParse('%Y-%m-%d');
	const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
	const seriesColors = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc'];

	/* --------------------------------------------
	 * Cast values
	 */
	data.forEach((d) => {
		d[xKey] = typeof d[xKey] === 'string' ? xKeyCast(d[xKey]) : d[xKey];
	});

	const formatLabelX = timeFormat('%b. %e');
	const formatLabelY = (d) => format(`~s`)(d);
	const groupedData = groupLonger(data, seriesNames, { groupTo: zKey, valueTo: yKey });
	var div = root_2();
	var node = $.child(div);

	{
		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => flatten(groupedData, 'values'));

		LayerCake(node, {
			padding: { top: 7, right: 10, bottom: 20, left: 25 },
			x: xKey,
			y: yKey,
			z: zKey,
			yDomain: [0, null],
			get zScale() {
				return $.get($0);
			},

			get zRange() {
				return seriesColors;
			},

			get flatData() {
				return $.get($1);
			},

			get data() {
				return groupedData;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				Svg(node_1, {
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

						AxisY(node_3, { ticks: 4, format: formatLabelY });

						var node_4 = $.sibling(node_3, 2);

						MultiLine(node_4, {});
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_1, 2);

				Html(node_5, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_6 = $.first_child(fragment_2);

						Labels(node_6, {});

						var node_7 = $.sibling(node_6, 2);

						SharedTooltip(node_7, {
							get formatTitle() {
								return formatLabelX;
							},

							get dataset() {
								return data;
							}
						});

						$.append($$anchor, fragment_2);
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