import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';

export default function BarChartFixedWidthTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, x, y, orientation = 'vertical', barWidth, barHeight } = $$props;
		const valueAxis = $.derived(() => orientation === 'horizontal' ? 'x' : 'y');
		const xScale = $.derived(() => valueAxis() === 'y' ? scaleBand().padding(0.4) : undefined);
		const yScale = $.derived(() => valueAxis() === 'x' ? scaleBand().padding(0.4) : undefined);

		Chart($$renderer, {
			data,
			x,
			y,
			xScale: xScale(),
			yScale: yScale(),
			valueAxis: valueAxis(),
			xBaseline: valueAxis() === 'x' ? 0 : undefined,
			yBaseline: valueAxis() === 'y' ? 0 : undefined,
			yDomain: valueAxis() === 'y' ? [0, null] : undefined,
			xDomain: valueAxis() === 'x' ? [0, null] : undefined,
			yNice: valueAxis() === 'y',
			xNice: valueAxis() === 'x',
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Bars($$renderer, { width: barWidth, height: barHeight });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}