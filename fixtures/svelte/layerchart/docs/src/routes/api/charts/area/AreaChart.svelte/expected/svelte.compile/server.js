import * as $ from 'svelte/internal/server';
import { ServerChart } from 'layerchart/server';
import { Area, Axis, Grid, Spline } from 'layerchart';

export default function AreaChart($$renderer, $$props) {
	let { data, width, height, capture, onCapture } = $$props;

	ServerChart($$renderer, {
		capture,
		onCapture,
		width,
		height,
		data,
		x: 'date',
		y: 'value',
		yDomain: [0, null],
		padding: { top: 20, right: 20, bottom: 30, left: 40 },
		children: ($$renderer) => {
			Grid($$renderer, { y: true, stroke: 'rgba(0,0,0,0.1)' });
			$$renderer.push(`<!----> `);

			Axis($$renderer, {
				placement: 'bottom',
				rule: true,
				stroke: 'rgba(0,0,0,0.3)',
				fill: 'rgba(0,0,0,0.5)'
			});

			$$renderer.push(`<!----> `);

			Axis($$renderer, {
				placement: 'left',
				stroke: 'rgba(0,0,0,0.3)',
				fill: 'rgba(0,0,0,0.5)'
			});

			$$renderer.push(`<!----> `);

			Area($$renderer, {
				y1: 'value2',
				fill: 'rgba(249, 115, 22, 0.15)',
				stroke: 'none'
			});

			$$renderer.push(`<!----> `);
			Spline($$renderer, { y: 'value2', stroke: 'rgb(249, 115, 22)', strokeWidth: 2 });
			$$renderer.push(`<!----> `);
			Area($$renderer, { fill: 'rgba(59, 130, 246, 0.15)', stroke: 'none' });
			$$renderer.push(`<!----> `);
			Spline($$renderer, { stroke: 'rgb(59, 130, 246)', strokeWidth: 2 });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}