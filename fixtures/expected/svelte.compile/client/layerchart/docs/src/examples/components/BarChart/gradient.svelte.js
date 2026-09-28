import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, LinearGradient, Bars } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Gradient($$anchor, $$props) {
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
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
				{
					const children = ($$anchor, $$arg0) => {
						let gradient = () => ($$arg0?.()).gradient;

						Bars($$anchor, {
							get fill() {
								return gradient();
							},
							radius: 4,
							rounded: 'top'
						});
					};

					LinearGradient($$anchor, {
						class: 'from-blue-500 to-green-400',
						vertical: true,
						units: 'userSpaceOnUse',
						children,
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}