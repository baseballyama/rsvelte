import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Cell, Axis, Layer } from 'layerchart';
import { scaleBand, scaleQuantize } from 'd3-scale';
import { schemeBlues } from 'd3-scale-chromatic';
import { extent } from 'd3-array';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Circle($$anchor, $$props) {
	$.push($$props, true);

	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	const hours = ['9am', '10am', '11am', '12pm', '1pm'];

	// Use seeded random for consistent results
	let seed = 42;

	function seededRandom() {
		seed = seed * 16807 % 2147483647;

		return (seed - 1) / 2147483646;
	}

	const data = days.flatMap((day) => hours.map((hour) => ({ day, hour, value: Math.floor(seededRandom() * 100) })));

	{
		let $0 = $.derived(scaleBand);
		let $1 = $.derived(scaleBand);
		let $2 = $.derived(scaleQuantize);
		let $3 = $.derived(() => extent(data, (d) => d.value));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'day',
			get xScale() {
				return $.get($0);
			},
			y: 'hour',
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
				return schemeBlues[5];
			},
			padding: { top: 4, bottom: 20, left: 36, right: 4 },
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

						Cell(node_2, { x: 'day', y: 'hour', shape: 'circle', fill: 'value' });
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