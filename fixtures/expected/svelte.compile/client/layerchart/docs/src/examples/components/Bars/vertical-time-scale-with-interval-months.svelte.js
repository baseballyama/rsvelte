import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleTime } from 'd3-scale';
import { timeDay } from 'd3-time';
import { Axis, Bars, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Vertical_time_scale_with_interval_months($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 20, min: 20, max: 100 });
	var $$exports = { data };

	{
		let $0 = $.derived(scaleTime);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xScale() {
				return $.get($0);
			},

			get xInterval() {
				return timeDay;
			},
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			padding: { left: 24, bottom: 28, top: 8 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true, tickMultiline: true });

						var node_2 = $.sibling(node_1, 2);

						Bars(node_2, { strokeWidth: 1, class: 'fill-primary' });
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