import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Labels, LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_labels_hover($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Labels($$anchor, {
						get seriesKey() {
							return context().series.highlightKey;
						},
						offset: 10
					});
				};

				$.if(node, ($$render) => {
					if (context().series.highlightKey) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],
			padding: 20,
			height: 300,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}