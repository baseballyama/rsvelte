import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import Line from '../../_components/Line.svelte';
import Area from '../../_components/Area.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import data from '../../_data/points.csv';

export default function Line_1($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';

	$$renderer.push(`<div class="chart-container svelte-bce511">`);

	LayerCake($$renderer, {
		padding: { top: 8, right: 10, bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		yDomain: [0, null],
		data,
		children: ($$renderer) => {
			Svg($$renderer, {
				children: ($$renderer) => {
					AxisX($$renderer, {});
					$$renderer.push(`<!----> `);
					AxisY($$renderer, { ticks: 4 });
					$$renderer.push(`<!----> `);
					Line($$renderer, {});
					$$renderer.push(`<!----> `);
					Area($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}