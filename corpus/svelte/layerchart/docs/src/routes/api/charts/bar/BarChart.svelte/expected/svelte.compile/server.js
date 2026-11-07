import * as $ from 'svelte/internal/server';
import { ServerChart } from 'layerchart/server';
import { Axis, Bars, Grid } from 'layerchart';
import { scaleBand } from 'd3-scale';

export default function BarChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, width, height, capture, onCapture } = $$props;

		ServerChart($$renderer, {
			capture,
			onCapture,
			width,
			height,
			data,
			x: 'category',
			xScale: scaleBand().paddingInner(0.2).paddingOuter(0.1),
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
				Bars($$renderer, { fill: 'rgb(59, 130, 246)', radius: 4 });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}