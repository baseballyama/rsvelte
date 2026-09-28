import * as $ from 'svelte/internal/server';
import { Chart, Cell, Axis, Grid, Layer } from 'layerchart';
import { scaleBand } from 'd3-scale';
import { range } from 'd3-array';
import { timeWeek, timeYear } from 'd3-time';
import { createDateSeries } from '$lib/utils/data.js';

export default function Punchcard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });
		const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		Chart($$renderer, {
			data,
			x: (d) => timeWeek.count(timeYear(d.date), d.date),
			xScale: scaleBand(),
			y: (d) => d.date.getDay(),
			yScale: scaleBand(),
			yDomain: range(7),
			r: 'value',
			rRange: [0, 16],
			padding: { left: 32, bottom: 16 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							format: (d) => 'Week\u00A0' + d,
							rule: true
						});

						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', format: (d) => daysOfWeek[d], rule: true });
						$$renderer.push(`<!----> `);
						Grid($$renderer, { x: false, y: true, bandAlign: 'between' });
						$$renderer.push(`<!----> `);

						Cell($$renderer, {
							x: (d) => timeWeek.count(timeYear(d.date), d.date),
							y: (d) => d.date.getDay(),
							shape: 'circle',
							r: 'value',
							fill: 'var(--color-primary)'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}