import * as $ from 'svelte/internal/server';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Penguins($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = penguins.filter((d) => d.body_mass_g != null);

		{
			function marks($$renderer, { context }) {
				const visibleSeries = context.series.visibleSeries;
				const visibleKeys = new Set(visibleSeries.map((s) => s.key));
				const visibleItems = data.filter((d) => visibleKeys.has(d.species));

				{
					function children($$renderer, { items: dodged }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(dodged);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: p, x, y, r, index } = each_array[$$index];
							const series = visibleSeries.find((s) => s.key === p.species);
							const opacity = context.series.isHighlighted(p.species, true) ? 1 : 0.2;

							Circle($$renderer, {
								cx: x,
								cy: y,
								r,
								fill: series?.color,
								opacity,
								class: 'stroke-surface-100',
								onpointermove: (e) => context.tooltip.show(e, p),
								onpointerleave: context.tooltip.hide
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						data: visibleItems,
						axis: 'y',
						anchor: 'bottom',
						r: 4,
						padding: 1,
						children,
						$$slots: { default: true }
					});
				}
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.species)}`);
								},
								$$slots: { default: true }
							});

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

										Tooltip.Item($$renderer, {
											label: 'Body mass',
											value: `${$.stringify(data.body_mass_g)} g`
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Flipper length',
											value: `${$.stringify(data.flipper_length_mm)} mm`
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Sex', value: data.sex ?? 'unknown' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Island', value: data.island });
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
						Tooltip.Root($$renderer, { context, children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data,
				x: 'body_mass_g',
				xNice: true,
				series: [
					{ key: 'Adelie', label: 'Adelie', color: 'var(--color-info)' },
					{
						key: 'Chinstrap',
						label: 'Chinstrap',
						color: 'var(--color-success)'
					},

					{
						key: 'Gentoo',
						label: 'Gentoo',
						color: 'var(--color-warning)'
					}
				],
				padding: { top: 20, bottom: 32, left: 12, right: 12 },
				height: 320,
				axis: 'x',
				legend: { placement: 'top', variant: 'swatches' },
				props: { xAxis: { label: 'Body mass (g)' } },
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}