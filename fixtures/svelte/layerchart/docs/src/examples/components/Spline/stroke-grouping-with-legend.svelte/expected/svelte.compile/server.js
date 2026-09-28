import * as $ from 'svelte/internal/server';
import { Axis, Chart, defaultChartPadding, Layer, Legend, Spline } from 'layerchart';
import { scalePoint } from 'd3-scale';
import { sort } from '@layerstack/utils';
import { longData } from '$lib/utils/data.js';

export default function Stroke_grouping_with_legend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// A point scale takes the domain in data order, so the years have to arrive in it
		const data = sort(longData, 'year');

		const series = [
			{ key: 'apples', color: 'var(--color-apples)' },
			{ key: 'bananas', color: 'var(--color-bananas)' },
			{ key: 'cherries', color: 'var(--color-cherries)' },
			{ key: 'grapes', color: 'var(--color-grapes)' }
		];

		Chart($$renderer, {
			data,
			x: 'year',
			xScale: scalePoint(),
			y: 'value',
			yNice: true,
			series,
			padding: defaultChartPadding({ legend: true, left: 24, bottom: 20 }),
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true, format: 'metric' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true, format: 'none' });
						$$renderer.push(`<!----> `);
						Spline($$renderer, { stroke: 'fruit', class: 'stroke-2' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Legend($$renderer, { placement: 'bottom' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}