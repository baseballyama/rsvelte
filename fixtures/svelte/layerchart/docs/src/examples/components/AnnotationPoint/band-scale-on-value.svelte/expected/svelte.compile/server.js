import * as $ from 'svelte/internal/server';
import { AnnotationPoint, BarChart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Band_scale_on_value($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function aboveContext($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						AnnotationPoint($$renderer, {
							x: data[3].date,
							y: data[3].value,
							r: 4,
							label: 'Featured',
							labelPlacement: 'top',
							props: {
								circle: { class: 'fill-secondary' },
								label: { class: 'text-xs fill-secondary font-bold' }
							}
						});
					},
					$$slots: { default: true }
				});
			}

			BarChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 300,
				aboveContext,
				$$slots: { aboveContext: true }
			});
		}

		$.bind_props($$props, { data });
	});
}