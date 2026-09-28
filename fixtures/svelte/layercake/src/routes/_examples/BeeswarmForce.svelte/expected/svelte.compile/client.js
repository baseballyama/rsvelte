import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import Key from '../../_components/Key.html.svelte';
import AxisX from '../../_components/AxisX.svelte';
import Beeswarm from '../../_components/BeeswarmForce.svelte';
import data from '../../_data/us-senate.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-11j8cgw"><!></div>`);

export default function BeeswarmForce($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'date_of_birth';

	const zKey = 'gender';
	const titleKey = 'name';
	const r = 6;
	const seriesColors = ['#fc0', '#000'];

	const dataTransformed = data.map((d) => {
		return {
			[titleKey]: d[titleKey],
			[zKey]: d[zKey],
			[xKey]: +d[xKey].split('-')[0]
		};
	});

	var div = root_1();
	var node = $.child(div);

	{
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

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Svg(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						AxisX(node_2, {});

						var node_3 = $.sibling(node_2, 2);

						Beeswarm(node_3, {
							r,
							strokeWidth: 1,
							xStrength: 0.95,
							yStrength: 0.075,
							getTitle: (d) => d[titleKey]
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_1, 2);

				Html(node_4, {
					pointerEvents: false,
					children: ($$anchor, $$slotProps) => {
						Key($$anchor, { shape: 'circle' });
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