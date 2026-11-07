import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Labels, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function With_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			padding: 20,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Area($$renderer, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/30'
						});

						$$renderer.push(`<!----> `);
						Labels($$renderer, { format: 'integer' });
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