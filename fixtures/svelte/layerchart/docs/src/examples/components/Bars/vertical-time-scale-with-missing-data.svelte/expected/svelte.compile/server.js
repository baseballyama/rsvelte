import * as $ from 'svelte/internal/server';
import { scaleTime } from 'd3-scale';
import { Axis, Bars, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { createDateSeries } from '$lib/utils/data';

export default function Vertical_time_scale_with_missing_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, min: 20, max: 100 });

		Chart($$renderer, {
			data: data.filter((d) => Math.random() > 0.3),
			x: 'date',
			xScale: scaleTime(),
			xInterval: timeDay,
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			padding: { left: 24, bottom: 28, top: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true, tickMultiline: true });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
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