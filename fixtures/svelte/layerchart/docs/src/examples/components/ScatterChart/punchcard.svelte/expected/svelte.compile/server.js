import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { range } from 'd3-array';
import { timeWeek, timeYear } from 'd3-time';
import { Highlight, ScatterChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Punchcard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });
		const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		{
			function highlight($$renderer) {
				Highlight($$renderer, { area: true, axis: 'x' });
				$$renderer.push(`<!----> `);
				Highlight($$renderer, { area: true, axis: 'y' });
				$$renderer.push(`<!---->`);
			}

			function tooltip($$renderer) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.date, format: 'day' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'value', value: data.value, valueAlign: 'right' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			ScatterChart($$renderer, {
				data,
				x: (d) => timeWeek.count(timeYear(d.date), d.date),
				xScale: scaleBand(),
				y: (d) => d.date.getDay(),
				yScale: scaleBand(),
				yDomain: range(7),
				r: 'value',
				rRange: [0, 16],
				props: {
					xAxis: { format: (d) => 'Week ' + d },
					yAxis: { format: (d) => daysOfWeek[d] },
					rule: { x: true, y: false },
					grid: { x: false, y: true, bandAlign: 'between' },
					tooltip: { context: { mode: 'band' } }
				},
				padding: { left: 32, bottom: 16 },
				height: 300,
				highlight,
				tooltip,
				$$slots: { highlight: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}