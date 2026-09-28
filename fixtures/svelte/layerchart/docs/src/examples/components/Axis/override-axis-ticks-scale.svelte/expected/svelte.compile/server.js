import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { scaleBand, scaleTime } from 'd3-scale';
import { createDateSeries } from '$lib/utils/data';

export default function Override_axis_ticks_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 100, min: 50, max: 100, value: 'integer' });

		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleBand(),
			y: 'value',
			padding: 24,
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							rule: true,
							ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks(scale.range()[1] / 80)
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}