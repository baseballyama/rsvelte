import * as $ from 'svelte/internal/server';
import { Chart, Cell, Axis, Layer } from 'layerchart';
import { scaleBand, scaleQuantize } from 'd3-scale';
import { schemeGreens } from 'd3-scale-chromatic';
import { extent } from 'd3-array';

export default function Rounded_insets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
		const rows = ['1', '2', '3', '4', '5'];

		// Use seeded random for consistent results
		let seed = 7;

		function seededRandom() {
			seed = seed * 16807 % 2147483647;

			return (seed - 1) / 2147483646;
		}

		const data = rows.flatMap((row) => columns.map((col) => ({ row, col, value: Math.floor(seededRandom() * 100) })));

		Chart($$renderer, {
			data,
			x: 'col',
			xScale: scaleBand(),
			y: 'row',
			yScale: scaleBand(),
			c: 'value',
			cScale: scaleQuantize(),
			cDomain: extent(data, (d) => d.value),
			cRange: schemeGreens[6],
			padding: { top: 4, bottom: 20, left: 16, right: 4 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Cell($$renderer, { x: 'col', y: 'row', fill: 'value', insets: { all: 2 }, rx: 4 });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}