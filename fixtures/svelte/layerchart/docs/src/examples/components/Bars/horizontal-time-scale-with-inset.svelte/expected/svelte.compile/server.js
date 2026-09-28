import * as $ from 'svelte/internal/server';
import { timeDay } from 'd3-time';
import { Bars, Axis, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal_time_scale_with_inset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		Chart($$renderer, {
			data,
			x: 'value',
			xDomain: [0, null],
			xNice: 4,
			y: 'date',
			yInterval: timeDay,
			padding: { left: 32, bottom: 20, right: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { class: 'fill-primary', insets: { y: 2 } });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}