import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { extent } from 'd3-array';

import {
	Axis,
	BoxPlot,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	Violin,
	computeBoxStats
} from 'layerchart';

export default function With_violin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Generate 5 distributions with different characteristics
		function generateSamples(count, mean, stddev) {
			const values = [];

			for (let i = 0; i < count; i++) {
				// Box-Muller transform for normal distribution
				const u1 = Math.random();

				const u2 = Math.random();
				const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

				values.push(mean + z * stddev);
			}

			return values;
		}

		const distributions = [
			{ group: 'A', mean: 50, stddev: 12 },
			{ group: 'B', mean: 40, stddev: 8 },
			{ group: 'C', mean: 60, stddev: 15 },
			{ group: 'D', mean: 45, stddev: 10 },
			{ group: 'E', mean: 55, stddev: 18 }
		];

		const data = distributions.map((d) => {
			const values = generateSamples(200, d.mean, d.stddev);

			return { group: d.group, values, ...computeBoxStats(values) };
		});

		const yDomain = extent(data.flatMap((d) => d.values));

		Chart($$renderer, {
			data,
			x: 'group',
			xScale: scaleBand().padding(0.2),
			y: 'median',
			yDomain,
			yNice: true,
			tooltipContext: { mode: 'band' },
			padding: { left: 30, bottom: 24, top: 8, right: 8 },
			height: 350,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(data);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							Violin($$renderer, {
								data: item,
								values: 'values',
								fill: 'oklch(0.8 0.05 260)',
								fillOpacity: 0.25,
								stroke: 'oklch(0.7 0.08 260)',
								strokeWidth: 1
							});

							$$renderer.push(`<!----> `);

							BoxPlot($$renderer, {
								data: item,
								min: 'min',
								q1: 'q1',
								median: 'median',
								q3: 'q3',
								max: 'max',
								outliers: 'outliers',
								width: 16,
								fill: 'white',
								fillOpacity: 0.4,
								stroke: 'oklch(0.4 0.1 260)',
								strokeWidth: 1.5,
								radius: 2,
								outlierRadius: 3
							});

							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]--> `);
						Highlight($$renderer, { area: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: `Group ${data.group}` });
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
										Tooltip.Item($$renderer, { label: 'Max', value: data.max, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Q3', value: data.q3, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Median', value: data.median, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Q1', value: data.q1, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Min', value: data.min, format: 'decimal' });
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
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}