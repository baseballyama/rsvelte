import * as $ from 'svelte/internal/server';
import { createTimeSeries } from '$lib/utils/data';
import { Axis, Chart, Layer, Rule } from 'layerchart';

export default function Data_x_range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createTimeSeries();

		Chart($$renderer, {
			data,
			x: ['startDate', 'endDate'],
			y: 'name',
			padding: { top: 20, bottom: 20, left: 40, right: 20 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
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