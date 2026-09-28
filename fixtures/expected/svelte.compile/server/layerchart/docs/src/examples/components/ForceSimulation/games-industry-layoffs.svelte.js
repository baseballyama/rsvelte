import * as $ from 'svelte/internal/server';
import { scaleSqrt } from 'd3-scale';
import { forceX, forceY, forceCollide } from 'd3-force';
import { asAny, Axis, Chart, Circle, Layer, Text, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { getGamesLayoffs } from '$lib/data.remote';

const data = await getGamesLayoffs();

export default function Games_industry_layoffs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Colors mirror the original Observable notebook (yellow→orange→red as years progress).
		const yearColor = { 2022: '#facc42', 2023: '#f09855', 2024: '#e74e45' };

		const unknownColor = '#cccccc';
		const radiusScale = scaleSqrt().domain([0, 5000]).range([4, 28]);
		const labelThreshold = 500;
		const nodes = $.derived(() => data.map((d) => ({ ...d, r: d.headcount != null ? radiusScale(d.headcount) : 6 })));
		const xForce = forceX().strength(0.95);
		const yForce = forceY().strength(0.06);
		const collideForce = forceCollide().radius((d) => d.r + 1);

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							rule: true,
							grid: true,
							format: (d) => d.getUTCFullYear().toString()
						});

						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { nodes }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(nodes);

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let node = each_array[index];
									const year = node.date.getUTCFullYear();
									const color = node.headcount == null ? unknownColor : yearColor[year] ?? unknownColor;

									Circle($$renderer, {
										cx: node.x,
										cy: node.y,
										r: node.r,
										fill: color,
										fillOpacity: node.headcount == null ? 0.5 : 1,
										stroke: 'var(--color-surface-100)',
										onpointermove: (e) => context.tooltip.show(e, node),
										onpointerleave: context.tooltip.hide
									});
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_1 = $.ensure_array_like(nodes.filter((n) => n.headcount != null && n.headcount >= labelThreshold));

								for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
									let node = each_array_1[index];

									Text($$renderer, {
										x: node.x,
										y: node.y,
										value: node.studio,
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										fontSize: Math.min(11, node.r * 0.6),
										stroke: 'var(--color-surface-100)',
										strokeWidth: 2,
										class: 'pointer-events-none'
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							ForceSimulation($$renderer, {
								forces: {
									x: xForce.x((d) => context.xGet(asAny(d))),
									y: yForce.y(context.height / 2),
									collide: collideForce
								},
								data: { nodes: nodes() },
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.studio)}`);
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
										Tooltip.Item($$renderer, { label: 'Date', value: data.date, format: 'day' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (data.headcount != null) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Headcount', value: data.headcount, format: 'integer' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Headcount', value: 'Unknown' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--> `);

									if (data.parent) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Parent', value: data.parent });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (data.type) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Type', value: data.type });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
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
				x: 'date',
				xNice: true,
				padding: { top: 12, bottom: 28, left: 12, right: 12 },
				height: 420,
				children,
				$$slots: { default: true }
			});
		}
	});
}