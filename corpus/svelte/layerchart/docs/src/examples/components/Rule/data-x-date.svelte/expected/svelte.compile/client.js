import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createDateSeries } from '$lib/utils/data';
import { Axis, Chart, Layer, Rule } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Data_x_date($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 20, keys: ['value', 'low', 'high'] });
	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yNice: true,
		padding: 20,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left' });

					var node_2 = $.sibling(node_1, 2);

					Rule(node_2, { class: 'stroke-4 stroke-primary' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}