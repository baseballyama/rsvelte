import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import ScatterHtml from '../../_components/Scatter.html.svelte';
import QuadTreePercentRange from '../../_components/QuadTree.percent-range.html.svelte';
import data from '../../_data/points.csv';

export default function QuadTree_percent_range_html($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 6;

	$$renderer.push(`<div class="chart-container svelte-oe2vps">`);

	LayerCake($$renderer, {
		ssr: true,
		percentRange: true,
		padding: { top: 20 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					ScatterHtml($$renderer, { r });
					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { x, y, visible }) {
							$$renderer.push(`<div class="circle svelte-oe2vps"${$.attr_style(`top:${$.stringify(y)}%;left:${$.stringify(x)}%;display: ${visible ? 'block' : 'none'};`)}></div>`);
						}

						QuadTreePercentRange($$renderer, { children, $$slots: { default: true } });
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}