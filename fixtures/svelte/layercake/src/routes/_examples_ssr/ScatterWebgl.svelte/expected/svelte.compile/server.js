import * as $ from 'svelte/internal/server';
import { LayerCake, WebGL, Html } from 'layercake';
import ScatterWebGL from '../../_components/Scatter.webgl.svelte';
import AxisX from '../../_components/AxisX.percent-range.html.svelte';
import AxisY from '../../_components/AxisY.percent-range.html.svelte';
import QuadTree from '../../_components/QuadTree.html.svelte';
import data from '../../_data/points.csv';

export default function ScatterWebgl($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const xyPadding = 6;
	const padding = { top: 5, right: 5, bottom: 20, left: 25 };

	$$renderer.push(`<div class="chart-container svelte-1iq9onh">`);

	LayerCake($$renderer, {
		position: 'absolute',
		ssr: true,
		percentRange: true,
		padding,
		x: xKey,
		y: yKey,
		xPadding: [xyPadding, xyPadding],
		yPadding: [xyPadding, xyPadding],
		data,
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					AxisX($$renderer, {});
					$$renderer.push(`<!----> `);
					AxisY($$renderer, { tickMarks: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	LayerCake($$renderer, {
		position: 'absolute',
		padding,
		x: xKey,
		y: yKey,
		xPadding: [xyPadding, xyPadding],
		yPadding: [xyPadding, xyPadding],
		data,
		children: ($$renderer) => {
			WebGL($$renderer, {
				children: ($$renderer) => {
					ScatterWebGL($$renderer, { r });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Html($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { x, y, visible }) {
							$$renderer.push(`<div class="circle svelte-1iq9onh"${$.attr_style(`top:${$.stringify(y)}px;left:${$.stringify(x)}px;display: ${visible ? 'block' : 'none'};`)}></div>`);
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