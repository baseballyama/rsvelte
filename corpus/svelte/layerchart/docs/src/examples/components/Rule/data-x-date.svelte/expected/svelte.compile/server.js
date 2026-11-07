import * as $ from 'svelte/internal/server';
import { createDateSeries } from '$lib/utils/data';
import { Axis, Chart, Layer, Rule } from 'layerchart';

export default function Data_x_date($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, keys: ['value', 'low', 'high'] });

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yNice: true,
			padding: 20,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left' });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { class: 'stroke-4 stroke-primary' });
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