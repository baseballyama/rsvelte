import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { scaleBand, scaleTime } from 'd3-scale';
import { createDateSeries } from '$lib/utils/data';

export default function Override_axis_ticks_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 100, min: 50, max: 100, value: 'integer' });

	{
		let $0 = $.derived(scaleBand);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			padding: 24,
			height: 48,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Axis($$anchor, {
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
	}

	$.pop();
}