import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { hsl } from 'd3-color';

import {
	Arc,
	ArcLabel,
	Bounds,
	Chart,
	ClipPath,
	Layer,
	Tooltip,
	findAncestor
} from 'layerchart';

import { Partition } from 'layerchart/hierarchy';
import { Breadcrumb, Button } from 'svelte-ux';
import { format, sortFunc, compoundSortFunc } from '@layerstack/utils';
import SunburstControls from '$lib/components/controls/SunburstControls.svelte';
import { getFlare } from '$lib/data.remote';

let data = await getFlare();

export default function Sunburst($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let colorBy = 'parent';
		const complexHierarchy = hierarchy(data).sum((d) => d.value).sort(compoundSortFunc(sortFunc('height', 'desc'), sortFunc('value', 'desc')));
		let selected = complexHierarchy; // select root initially
		const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);

		// filter out hard to see yellow and green
		const ordinalColor = scaleOrdinal(chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90));

		// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)
		function getNodeColor(node, colorBy) {
			switch (colorBy) {
				case 'children':
					return node.children ? '#ccc' : '#ddd';

				case 'depth':
					return sequentialColor(node.depth).toString();

				case 'parent':
					const colorParent = findAncestor(node, (n) => n.depth === 1);
					return colorParent
						? hsl(ordinalColor(colorParent.data.name)).brighter(node.depth * 0.3).toString()
						: '#ddd';
			}

			return '';
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SunburstControls($$renderer, {
				get colorBy() {
					return colorBy;
				},

				set colorBy($$value) {
					colorBy = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Breadcrumb($$renderer, {
				items: selected?.ancestors().reverse() ?? [],
				class: 'my-2',
				$$slots: {
					item: ($$renderer, { item }) => {
						Button($$renderer, {
							slot: 'item',
							base: true,
							class: 'px-2 py-1 rounded-sm',
							children: ($$renderer) => {
								$$renderer.push(`<div class="text-left"><div class="text-sm">${$.escape(item.data.name)}</div> <div class="text-xs text-surface-content/50">${$.escape(format(item.value ?? 0, 'integer'))}</div></div>`);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						center: true,
						children: ($$renderer) => {
							{
								function children($$renderer, { xScale, yScale }) {
									{
										function children($$renderer, { nodes }) {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(nodes);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let node = each_array[$$index];
												const isRoot = node.depth === 0;
												const nodeColor = getNodeColor(node, colorBy);
												const startAngle = Math.max(0, Math.min(2 * Math.PI, xScale(node.x0)));
												const endAngle = Math.max(0, Math.min(2 * Math.PI, xScale(node.x1)));
												const innerRadius = Math.max(0, yScale(node.y0));
												const outerRadius = Math.max(0, yScale(node.y1));
												const angle = endAngle - startAngle;
												const thickness = outerRadius - innerRadius;

												{
													function children($$renderer, arcProps) {
														if (!isRoot && angle > 0.05 && thickness > 10) {
															$$renderer.push('<!--[0-->');

															{
																function clip($$renderer) {
																	Arc($$renderer, { startAngle, endAngle, innerRadius, outerRadius });
																}

																ClipPath($$renderer, {
																	clip,
																	children: ($$renderer) => {
																		ArcLabel($$renderer, $.spread_props([
																			arcProps,
																			{
																				placement: 'centroid-radial',
																				value: node.data.name,
																				class: 'text-[8px] fill-black pointer-events-none'
																			}
																		]));
																	},
																	$$slots: { clip: true, default: true }
																});
															}
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													}

													Arc($$renderer, {
														value: node.value,
														startAngle,
														endAngle,
														innerRadius,
														outerRadius,
														fill: isRoot ? 'transparent' : nodeColor,
														class: isRoot
															? 'stroke-none cursor-pointer'
															: 'stroke-surface-300 cursor-pointer',

														onclick: () => {
															selected = node;
														},
														onpointermove: (e) => context.tooltip.show(e, node),
														onpointerleave: context.tooltip.hide,
														children,
														$$slots: { default: true }
													});
												}
											}

											$$renderer.push(`<!--]-->`);
										}

										Partition($$renderer, {
											hierarchy: complexHierarchy,
											size: [1, 1],
											children,
											$$slots: { default: true }
										});
									}
								}

								Bounds($$renderer, {
									domain: {
										x0: selected?.x0 ?? 0,
										x1: selected?.x1 ?? 1,
										y0: selected?.y0 ?? 0,
										y1: 1
									},

									range: ({ height }) => ({
										x0: 0,
										x1: 2 * Math.PI,
										y0: selected?.y0 ? 20 : 0,
										y1: height / 2
									}),
									motion: { type: 'tween', duration: 800, easing: cubicOut },
									children,
									$$slots: { default: true }
								});
							}
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
										$$renderer.push(`<!---->${$.escape(data.data.name)}`);
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
											Tooltip.Item($$renderer, { label: 'value', value: data.value, format: 'integer' });
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

				Chart($$renderer, { height: 800, children, $$slots: { default: true } });
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}