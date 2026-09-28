import * as $ from 'svelte/internal/server';
import { Chart, Dodge, Text, Tooltip } from 'layerchart';
import { getCountries2020 } from '$lib/data.remote';
import { scaleLog } from 'd3-scale';
import { sortFunc } from '@layerstack/utils';

const countries = await getCountries2020();
const data = [...countries].sort(sortFunc('population', 'desc'));

export default function Text_beeswarm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function marks($$renderer, { context }) {
				{
					function children($$renderer, { items }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: country, x, y, r, index } = each_array[$$index];

							Text($$renderer, {
								x,
								y,
								value: country.code2,
								fontSize: r * 1.1,
								textAnchor: 'middle',
								verticalAnchor: 'middle',
								fill: context.cScale?.(country.continent),
								class: 'font-semibold',
								onpointermove: (e) => context.tooltip.show(e, country),
								onpointerleave: context.tooltip.hide
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						axis: 'y',
						anchor: 'middle',
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
				data,
				x: 'lifeExpectancy',
				xNice: true,
				r: 'population',
				rRange: [2, 40],
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
				height: 420,
				axis: { placement: 'bottom', rule: true },
				props: { xAxis: { label: 'Life expectancy (log)' } },
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}