import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { ticks } from 'd3-array';

export default function Dynamic_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let data = ticks(-2, 2, 200).map(Math.sin);

		$$renderer.push(`<div>`);

		LineChart($$renderer, {
			data: data.map((d, i) => ({ x: i, y: d })),
			x: 'x',
			y: 'y',
			yBaseline: undefined,
			tooltipContext: false,
			motion: { type: 'spring' },
			props: {// spline: {
			//   draw: {
			//     // easing function to only draw the last data point
			//     easing: (t) => {
			//       const totalDataPoints = data.length;
			//       const percentage = (totalDataPoints - 10) / totalDataPoints;
			//       const minT = 1 * percentage;
			//       return minT + t * (1 - minT);
			//     },
			//     duration: 300,
			//   },
			// },
			},
			padding: defaultChartPadding({ right: 10 }),
			height: 300
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}