import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Spline } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { pivotLonger } from 'layerchart';

export default function Facet_lines($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const wide = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const data = pivotLonger(wide, keys, 'fruit', 'value');
	const series = keys.map((key) => ({ key, color: `var(--color-${key})` }));
	var $$exports = { data };

	{
		const marks = ($$anchor) => {
			Spline($$anchor, { stroke: 'fruit', class: 'stroke-2' });
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			fx: 'fruit',
			yDomain: [0, null],
			yNice: true,
			get series() {
				return series;
			},
			padding: { left: 44, bottom: 32, top: 24, right: 8 },
			height: 260,
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}