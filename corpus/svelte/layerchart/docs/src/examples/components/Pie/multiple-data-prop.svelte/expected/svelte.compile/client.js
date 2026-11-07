import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Multiple_data_prop($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'value',
		c: 'date',
		get cRange() {
			return keyColors;
		},
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Pie(node, {
						innerRadius: 100,
						get data() {
							return data;
						}
					});

					var node_1 = $.sibling(node, 2);

					Pie(node_1, {
						outerRadius: 90,
						get data() {
							return data2;
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}