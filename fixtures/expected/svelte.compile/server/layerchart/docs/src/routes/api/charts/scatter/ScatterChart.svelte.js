import * as $ from 'svelte/internal/server';
import { ServerChart } from 'layerchart/server';
import { Axis, Grid, Points } from 'layerchart';

export default function ScatterChart($$renderer, $$props) {
	let { data, width, height, capture, onCapture } = $$props;

	ServerChart($$renderer, {
		capture,
		onCapture,
		width,
		height,
		data,
		x: 'x',
		y: 'y',
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
				rule: true,
				stroke: 'rgba(0,0,0,0.3)',
				fill: 'rgba(0,0,0,0.5)'
			});

			$$renderer.push(`<!----> `);

			Points($$renderer, {
				fill: 'rgba(59, 130, 246, 0.6)',
				stroke: 'rgb(59, 130, 246)',
				strokeWidth: 1,
				r: 5
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}