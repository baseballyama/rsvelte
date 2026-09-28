import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Cell, Axis, Layer } from 'layerchart';
import { scaleBand, scaleQuantize } from 'd3-scale';
import { schemeGreens } from 'd3-scale-chromatic';
import { extent } from 'd3-array';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Rounded_insets($$anchor, $$props) {
	$.push($$props, true);

	const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
	const rows = ['1', '2', '3', '4', '5'];

	// Use seeded random for consistent results
	let seed = 7;

	function seededRandom() {
		seed = seed * 16807 % 2147483647;

		return (seed - 1) / 2147483646;
	}

	const data = rows.flatMap((row) => columns.map((col) => ({ row, col, value: Math.floor(seededRandom() * 100) })));

	{
		let $0 = $.derived(scaleBand);
		let $1 = $.derived(scaleBand);
		let $2 = $.derived(scaleQuantize);
		let $3 = $.derived(() => extent(data, (d) => d.value));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'col',
			get xScale() {
				return $.get($0);
			},
			y: 'row',
			get yScale() {
				return $.get($1);
			},
			c: 'value',
			get cScale() {
				return $.get($2);
			},

			get cDomain() {
				return $.get($3);
			},

			get cRange() {
				return schemeGreens[6];
			},
			padding: { top: 4, bottom: 20, left: 16, right: 4 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'bottom', rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'left', rule: true });

						var node_2 = $.sibling(node_1, 2);

						Cell(node_2, { x: 'col', y: 'row', fill: 'value', insets: { all: 2 }, rx: 4 });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}