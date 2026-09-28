import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, flatten, stack } from 'layercake';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import BarStacked from '../../_components/BarStacked.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/fruitOrdinal.csv';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-qzc0e1"><!></div>`);

export default function BarStacked_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = [0, 1];

	const yKey = 'year';
	const zKey = 'key';
	const seriesNames = Object.keys(data[0]).filter((d) => d !== yKey);
	const seriesColors = ['#00bbff', '#8bcef6', '#c4e2ed', '#f7f6e3'];
	const formatLabelX = (d) => format(`~s`)(d);
	const stackedData = stack(data, seriesNames);
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.05));
		let $1 = $.derived(scaleOrdinal);
		let $2 = $.derived(() => flatten(stackedData));

		LayerCake(node, {
			padding: { top: 0, bottom: 20, left: 35 },
			get x() {
				return xKey;
			},
			y: (d) => d.data[yKey],
			z: zKey,
			get yScale() {
				return $.get($0);
			},

			get zScale() {
				return $.get($1);
			},
			yDomainSort: true,
			get zDomain() {
				return seriesNames;
			},

			get zRange() {
				return seriesColors;
			},

			get flatData() {
				return $.get($2);
			},

			get data() {
				return stackedData;
			},

			children: ($$anchor, $$slotProps) => {
				Svg($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						AxisX(node_1, { baseline: true, snapLabels: true, format: formatLabelX });

						var node_2 = $.sibling(node_1, 2);

						AxisY(node_2, { gridlines: false });

						var node_3 = $.sibling(node_2, 2);

						BarStacked(node_3, {});
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