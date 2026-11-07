import * as $ from 'svelte/internal/server';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';
import { getPenguins } from '$lib/data.remote';

const data = await getPenguins();

export default function Grouped_horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function marks($$renderer, { context }) {
				const bandwidth = context.yScale.bandwidth?.() ?? 0;
				const visibleSeries = context.series.visibleSeries;
				const visibleKeys = new Set(visibleSeries.map((s) => s.key));
				const visibleData = data.filter((d) => visibleKeys.has(d.sex));

				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(context.yDomain);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let s = each_array[$$index_1];
					const bandTop = context.yScale(s) ?? 0;
					const items = visibleData.filter((d) => d.species === s);

					{
						function children($$renderer, { items: dodged }) {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(dodged);

							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
								let { data: p, x, y, r, index } = each_array_1[$$index];
								const series = visibleSeries.find((vs) => vs.key === p.sex);
								const opacity = context.series.isHighlighted(p.sex, true) ? 1 : 0.2;

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
							data: items,
							axis: 'y',
							anchor: 'middle',
							baseline: bandTop + bandwidth / 2,
							r: 3,
							padding: 1,
							position: (d) => Number(context.xGet(d)) || 0,
							children,
							$$slots: { default: true }
						});
					}
				}

				$$renderer.push(`<!--]-->`);
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
										Tooltip.Item($$renderer, { label: 'Sex', value: data.sex });
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
				y: 'species',
				bandPadding: 0.2,
				x: 'body_mass_g',
				xNice: true,
				valueAxis: 'x',
				series: [
					{
						key: 'female',
						label: 'Female',
						color: 'var(--color-warning)'
					},
					{ key: 'male', label: 'Male', color: 'var(--color-info)' }
				],
				seriesLayout: 'overlap',
				legend: { placement: 'top', variant: 'swatches' },
				padding: { top: 12, bottom: 32, left: 80, right: 12 },
				height: 400,
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}