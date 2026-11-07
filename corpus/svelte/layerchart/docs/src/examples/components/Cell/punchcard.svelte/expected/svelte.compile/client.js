import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Cell, Axis, Grid, Layer } from 'layerchart';
import { scaleBand } from 'd3-scale';
import { range } from 'd3-array';
import { timeWeek, timeYear } from 'd3-time';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Punchcard($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var $$exports = { data };

	{
		let $0 = $.derived(scaleBand);
		let $1 = $.derived(scaleBand);
		let $2 = $.derived(() => range(7));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: (d) => timeWeek.count(timeYear(d.date), d.date),
			get xScale() {
				return $.get($0);
			},
			y: (d) => d.date.getDay(),
			get yScale() {
				return $.get($1);
			},

			get yDomain() {
				return $.get($2);
			},
			r: 'value',
			rRange: [0, 16],
			padding: { left: 32, bottom: 16 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, {
							placement: 'bottom',
							format: (d) => 'Week\u00A0' + d,
							rule: true
						});

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'left', format: (d) => daysOfWeek[d], rule: true });

						var node_2 = $.sibling(node_1, 2);

						Grid(node_2, { x: false, y: true, bandAlign: 'between' });

						var node_3 = $.sibling(node_2, 2);

						Cell(node_3, {
							x: (d) => timeWeek.count(timeYear(d.date), d.date),
							y: (d) => d.date.getDay(),
							shape: 'circle',
							r: 'value',
							fill: 'var(--color-primary)'
						});

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