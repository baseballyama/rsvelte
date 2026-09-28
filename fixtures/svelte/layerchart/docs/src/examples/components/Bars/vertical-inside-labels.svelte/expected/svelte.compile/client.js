import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Axis, Bars, Chart, Labels, Layer, Rule } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Vertical_inside_labels($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 20, min: -20, max: 50 });
	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.4));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			yBaseline: 0,
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

						var node_2 = $.sibling(node_1, 2);

						Rule(node_2, { y: 0 });

						var node_3 = $.sibling(node_2, 2);

						Bars(node_3, { strokeWidth: 1, class: 'fill-primary' });

						var node_4 = $.sibling(node_3, 2);

						Labels(node_4, { placement: 'inside', format: 'integer', class: 'fill-black' });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}