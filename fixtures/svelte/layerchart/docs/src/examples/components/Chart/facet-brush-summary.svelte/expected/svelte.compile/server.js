import * as $ from 'svelte/internal/server';
import { bin } from 'd3-array';
import { BarChart, Chart, ChartGroup, Circle, Points } from 'layerchart';
import { cls } from '@layerstack/tailwind';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Facet_brush_summary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');

		// Each bin keeps its rows, so the selected count is a filter over the bin rather than a
		// second pass over the data
		const bins = bin().value((d) => d.body_mass_g).thresholds(10)(data);

		const kg = (mass) => ((mass ?? 0) / 1000).toFixed(1);

		{
			function children($$renderer, { group }) {
				const counts = bins.map((b) => ({
					mass: kg(b.x0),
					total: b.length,
					selected: b.filter((d) => group.brush.contains({ x: d.flipper_length_mm, y: d.body_mass_g })).length
				}));

				$$renderer.push(`<div class="grid gap-2">`);

				{
					function marks($$renderer, { context }) {
						{
							function children($$renderer, { points }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(points);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let point = each_array[$$index];
									const isSelected = context.brush.contains({ x: point.data.flipper_length_mm, y: point.data.body_mass_g });

									Circle($$renderer, {
										cx: point.x,
										cy: point.y,
										r: isSelected ? 4 : 2.5,
										class: cls(isSelected
											? 'fill-primary/40 stroke-primary'
											: 'fill-neutral/10 stroke-neutral/30'),
										motion: 'spring'
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Points($$renderer, { children, $$slots: { default: true } });
						}
					}

					Chart($$renderer, {
						data,
						x: 'flipper_length_mm',
						y: 'body_mass_g',
						fx: 'species',
						xNice: true,
						yNice: true,
						grid: true,
						brush: { axis: 'both' },
						padding: { left: 52, bottom: 32, top: 24, right: 8 },
						height: 260,
						marks,
						$$slots: { marks: true }
					});
				}

				$$renderer.push(`<!----> <div><div class="text-sm text-surface-content/70">Body mass (kg)</div> `);

				BarChart($$renderer, {
					data: counts,
					x: 'mass',
					series: [
						{
							key: 'total',
							color: 'var(--color-surface-content)',
							props: { opacity: 0.15 }
						},
						{ key: 'selected', color: 'var(--color-primary)' }
					],
					seriesLayout: 'overlap',
					groupOptions: { publish: false, subscribe: false },
					props: { bars: { motion: 'spring' } },
					legend: false,
					padding: { left: 32, bottom: 24 },
					height: 140
				});

				$$renderer.push(`<!----></div></div>`);
			}

			ChartGroup($$renderer, {
				brush: { axis: 'both' },
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}