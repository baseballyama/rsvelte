import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import { format } from 'd3-format';
import { scaleOrdinal } from 'd3-scale';
import Key from '../../_components/Key.html.svelte';
import AxisX from '../../_components/AxisX.svelte';
import Beeswarm from '../../_components/Beeswarm.svelte';
import data from '../../_data/cars-2.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-o51j4z"><!></div>`);

export default function Beeswarm_1($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'Weight_in_lbs';

	const zKey = 'Origin';
	const titleKey = 'Name';
	const r = 4;
	const seriesNames = new Set();
	const seriesColors = ['#ccc', '#fc0', '#000'];

	const dataTransformed = data.map((d) => {
		seriesNames.add(d[zKey]);

		return { [titleKey]: d[titleKey], [xKey]: +d[xKey], [zKey]: d[zKey] };
	});

	const addCommas = format(',');
	var div = root_1();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let width = () => ($$arg0?.()).width;
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Svg(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					AxisX(node_2, {
						baseline: true,
						get format() {
							return addCommas;
						},
						tickMarks: true
					});

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => width() < 400 ? r / 1.6 : r);

						Beeswarm(node_3, {
							get r() {
								return $.get($0);
							},
							spacing: 1,
							getTitle: (d) => d.data[titleKey]
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Html(node_4, {
				pointerEvents: false,
				children: ($$anchor, $$slotProps) => {
					Key($$anchor, { align: 'end', shape: 'circle', lookup: { USA: 'U.S.' } });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		};

		let $0 = $.derived(scaleOrdinal);

		LayerCake(node, {
			padding: { bottom: 15 },
			x: xKey,
			z: zKey,
			get zScale() {
				return $.get($0);
			},

			get zRange() {
				return seriesColors;
			},
			zDomainSort: true,
			get data() {
				return dataTransformed;
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}