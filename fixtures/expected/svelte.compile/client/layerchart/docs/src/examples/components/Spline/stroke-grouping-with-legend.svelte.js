import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, defaultChartPadding, Layer, Legend, Spline } from 'layerchart';
import { scalePoint } from 'd3-scale';
import { sort } from '@layerstack/utils';
import { longData } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Stroke_grouping_with_legend($$anchor, $$props) {
	$.push($$props, true);

	// A point scale takes the domain in data order, so the years have to arrive in it
	const data = sort(longData, 'year');

	const series = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'cherries', color: 'var(--color-cherries)' },
		{ key: 'grapes', color: 'var(--color-grapes)' }
	];

	var $$exports = { data };

	{
		let $0 = $.derived(scalePoint);
		let $1 = $.derived(() => defaultChartPadding({ legend: true, left: 24, bottom: 20 }));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'year',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			yNice: true,
			get series() {
				return series;
			},

			get padding() {
				return $.get($1);
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'left', grid: true, rule: true, format: 'metric' });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true, format: 'none' });

						var node_3 = $.sibling(node_2, 2);

						Spline(node_3, { stroke: 'fruit', class: 'stroke-2' });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node, 2);

				Legend(node_4, { placement: 'bottom' });
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}