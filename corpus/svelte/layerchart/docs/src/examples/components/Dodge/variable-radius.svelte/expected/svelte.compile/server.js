import * as $ from 'svelte/internal/server';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
import { sortFunc } from '@layerstack/utils';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';
import { getCountries2020 } from '$lib/data.remote';

const data = await getCountries2020();

export default function Variable_radius($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let sortOrder = 'unsorted';
		let minRadius = 2;
		let maxRadius = 20;

		const sortedData = $.derived(() => {
			if (sortOrder === 'unsorted') return data;

			// `sortFunc` is ascending by default; pass 'desc' for largest first.
			return [...data].sort(sortFunc('population', sortOrder));
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[auto_1fr_1fr] gap-4 mb-4 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Sort',
				dense: true,
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						get value() {
							return sortOrder;
						},

						set value($$value) {
							sortOrder = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'unsorted',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Unsorted`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'desc',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Largest first`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'asc',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Smallest first`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Min radius',
				min: 1,
				max: maxRadius - 1,
				get value() {
					return minRadius;
				},

				set value($$value) {
					minRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Max radius',
				min: minRadius + 1,
				max: 50,
				get value() {
					return maxRadius;
				},

				set value($$value) {
					maxRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			{
				function marks($$renderer, { context }) {
					{
						function children($$renderer, { items: dodged }) {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(dodged);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let { data: country, x, y, r, index } = each_array[$$index];

								Circle($$renderer, {
									data: [country],
									cx: x,
									cy: y,
									r,
									fill: 'continent',
									class: 'stroke-surface-100 opacity-80',
									onpointermove: (e) => context.tooltip.show(e, country),
									onpointerleave: context.tooltip.hide
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						Dodge($$renderer, {
							axis: 'y',
							anchor: 'bottom',
							padding: 0,
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
										$$renderer.push(`<!---->${$.escape(data.name)}`);
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
											Tooltip.Item($$renderer, { label: 'Continent', value: data.continent });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Life expectancy',
												value: `${$.stringify(data.lifeExpectancy.toFixed(1))} years`
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
												label: 'Population',
												value: data.population,
												format: 'metric'
											});

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
					data: sortedData(),
					x: 'lifeExpectancy',
					xNice: true,
					r: 'population',
					rRange: [minRadius, maxRadius],
					c: 'continent',
					cDomain: [
						'Africa',
						'Asia',
						'Europe',
						'North America',
						'Oceania',
						'South America'
					],
					cRange: [
						'var(--color-warning)',
						'var(--color-info)',
						'var(--color-success)',
						'var(--color-danger)',
						'var(--color-secondary)',
						'var(--color-primary)'
					],
					padding: { top: 12, bottom: 32, left: 12, right: 12 },
					height: 400,
					axis: { placement: 'bottom', rule: true },
					props: { xAxis: { label: 'Life expectancy (years)' } },
					marks,
					tooltip,
					$$slots: { marks: true, tooltip: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}