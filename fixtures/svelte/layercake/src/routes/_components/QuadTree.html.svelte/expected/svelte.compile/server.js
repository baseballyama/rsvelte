import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import ScatterSvg from '../../_components/Scatter.svg.svelte';
import QuadTree from '../../_components/QuadTree.html.svelte';
import data from '../../_data/points.csv';

export default function QuadTree_html($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 6;

	$$renderer.push(`<div class="chart-container svelte-1qtrb52">`);

	LayerCake($$renderer, {
		padding: { top: 20 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					ScatterSvg($$renderer, { r });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Html($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { x, y, visible }) {
							$$renderer.push(`<div class="circle svelte-1qtrb52"${$.attr_style(`top:${$.stringify(y)}px;left:${$.stringify(x)}px;display: ${visible ? 'block' : 'none'};`)}></div>`);
						}

						QuadTree($$renderer, { children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}