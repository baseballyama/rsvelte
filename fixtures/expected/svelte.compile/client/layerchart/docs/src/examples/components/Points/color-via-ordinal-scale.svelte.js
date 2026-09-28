import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Points, Spline } from 'layerchart';
import { curveMonotoneX } from 'd3-shape';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Color_via_ordinal_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yDomain: [0, 100],
		c: (d) => d.value >= d.baseline ? 'above' : 'below',
		cDomain: ['below', 'above'],
		cRange: ['var(--color-danger)', 'var(--color-success)'],
		padding: 20,
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

					Spline(node_2, {
						y: 'baseline',
						get curve() {
							return curveMonotoneX;
						},
						class: '[stroke-dasharray:4] opacity-20'
					});

					var node_3 = $.sibling(node_2, 2);

					Points(node_3, {});
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}