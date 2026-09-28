import * as $ from 'svelte/internal/server';
import { Chart, Spline } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { pivotLonger } from 'layerchart';

export default function Facet_lines($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const wide = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const data = pivotLonger(wide, keys, 'fruit', 'value');
		const series = keys.map((key) => ({ key, color: `var(--color-${key})` }));

		{
			function marks($$renderer) {
				Spline($$renderer, { stroke: 'fruit', class: 'stroke-2' });
			}

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				fx: 'fruit',
				yDomain: [0, null],
				yNice: true,
				series,
				padding: { left: 44, bottom: 32, top: 24, right: 8 },
				height: 260,
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}