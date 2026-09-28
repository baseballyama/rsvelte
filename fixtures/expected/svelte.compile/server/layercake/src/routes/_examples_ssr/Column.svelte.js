import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, ScaledSvg, Html } from 'layercake';
import { scaleBand } from 'd3-scale';
import Column from '../../_components/Column.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import Annotations from '../../_components/AnnotationsData.html.svelte';
import Arrows from '../../_components/Arrows.svelte';
import ArrowheadMarker from '../../_components/ArrowheadMarker.svelte';
import data from '../../_data/groups.csv';

export default function Column_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		const xKey = 'year';

		const yKey = 'value';

		const annotations = [
			{
				text: 'Example text...',
				[xKey]: 1980,
				[yKey]: 14,
				dx: 15, // Optional pixel values
				dy: -5,
				arrows: [
					{
						clockwise: false, // true or false, defaults to true
						source: {
							anchor: 'left-bottom', // can be `{left, middle, right},{top-middle-bottom}`
							dx: -2,
							dy: -7
						},
						target: {
							// These can be expressed in our data units if passed under the data keys
							[xKey]: 1980,
							[yKey]: 4.5,
							// Optional adjustments
							dx: 2,
							dy: 5
						}
					},

					{
						source: { anchor: 'right-bottom', dy: -7, dx: 5 },
						target: {
							// Or if they are percentage strings they can be passed directly
							x: '68%',
							y: '48%'
						}
					}
				]
			}
		];

		$$renderer.push(`<div class="chart-container svelte-qpudq6">`);

		LayerCake($$renderer, {
			ssr: true,
			percentRange: true,
			position: 'absolute',
			padding: { top: 0, right: 0, bottom: 20, left: 20 },
			x: xKey,
			y: yKey,
			xScale: scaleBand().paddingInner(0.028).round(true),
			xDomain: [1979, 1980, 1981, 1982, 1983],
			yDomain: [0, null],
			data,
			children: ($$renderer) => {
				ScaledSvg($$renderer, {
					children: ($$renderer) => {
						Column($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Html($$renderer, {
					children: ($$renderer) => {
						AxisX($$renderer, { gridlines: false });
						$$renderer.push(`<!----> `);
						AxisY($$renderer, { gridlines: false, snapBaselineLabel: true });
						$$renderer.push(`<!----> `);
						Annotations($$renderer, { annotations });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		LayerCake($$renderer, {
			position: 'absolute',
			padding: { top: 0, right: 0, bottom: 20, left: 20 },
			x: xKey,
			y: yKey,
			xScale: scaleBand().paddingInner(0.028).round(true),
			xDomain: [1979, 1980, 1981, 1982, 1983],
			yDomain: [0, null],
			data,
			children: ($$renderer) => {
				{
					function defs($$renderer) {
						ArrowheadMarker($$renderer, {});
					}

					Svg($$renderer, {
						defs,
						children: ($$renderer) => {
							Arrows($$renderer, { annotations });
						},
						$$slots: { defs: true, default: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}