import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { quantize } from 'd3-interpolate';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Spline } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Stroke_grouping($$anchor, $$props) {
	$.push($$props, true);

	const yearColor = scaleOrdinal(quantize(interpolateSpectral, 6));
	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yNice: true,
		padding: 25,
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
						stroke: (d) => yearColor(d.date.getFullYear()),
						class: 'stroke-2'
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