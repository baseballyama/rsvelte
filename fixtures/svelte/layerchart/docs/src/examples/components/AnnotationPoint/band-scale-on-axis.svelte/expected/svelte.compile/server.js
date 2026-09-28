import * as $ from 'svelte/internal/server';
import { AnnotationPoint, BarChart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Band_scale_on_axis($$renderer, $$props) {
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
							r: 4,
							label: 'Featured',
							labelPlacement: 'bottom',
							labelYOffset: 16,
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
				padding: { top: 5, left: 25, bottom: 35 },
				aboveContext,
				$$slots: { aboveContext: true }
			});
		}

		$.bind_props($$props, { data });
	});
}