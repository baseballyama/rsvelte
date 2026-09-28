import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AnnotationPoint, BarChart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Band_scale_on_value($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		const aboveContext = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					AnnotationPoint($$anchor, {
						get x() {
							return data[3].date;
						},

						get y() {
							return data[3].value;
						},
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
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			aboveContext,
			$$slots: { aboveContext: true }
		});
	}

	return $.pop($$exports);
}