import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';

import {
	Bounds,
	Chart,
	ChartClipPath,
	Group,
	Layer,
	Rect,
	RectClipPath,
	Text,
	Tooltip,
	parseFoldedStacks
} from 'layerchart';

import { Partition } from 'layerchart/hierarchy';
import { Breadcrumb, Button, ToggleGroup, ToggleOption } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { getFlameGraph } from '$lib/data.remote';

let data = await getFlameGraph();

export default function Flame_graph($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rowHeight = 24;
		const barHeight = rowHeight - 1; // leave a 1px gap between rows

		// `data` is a "folded stacks" profile (see getFlameGraph).  `parseFoldedStacks()` returns a d3
		// `HierarchyNode` where each frame's `value` is its _self_ samples, so `.sum()` accumulates them
		// into inclusive/total samples.
		const root = parseFoldedStacks(data, { rootName: 'all' }).sum((d) => d.value).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

		const totalValue = root.value ?? 0;
		const chartHeight = (root.height + 1) * rowHeight;
		let nodes = [];
		let focused = void 0; // `undefined` = root/full view
		let hoveredId = void 0;
		let layout = 'flame';

		function nodeId(node) {
			return node.ancestors().map((n) => n.data.name).join('/');
		}

		// Color accessor: hash the frame name to a [0,1] value (mapped to a warm color by the
		// `Chart`'s `cScale` — see the `c`/`cScale`/`cDomain` props below)
		function nameHash(name) {
			const maxChar = 6;
			const mod = 10;
			let hash = 0;
			let maxHash = 0;
			let weight = 1;

			for (let i = 0; i < Math.min(name.length, maxChar); i++) {
				hash += weight * (name.charCodeAt(i) % mod);
				maxHash += weight * (mod - 1);
				weight *= 0.7;
			}

			return maxHash > 0 ? hash / maxHash : 0;
		}

		const breadcrumbItems = $.derived(() => focused
			? focused.ancestors().reverse()
			: nodes[0]?.ancestors().reverse() ?? []);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-2 items-center justify-between mb-2 screenshot-hidden">`);

			ToggleGroup($$renderer, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				get value() {
					return layout;
				},

				set value($$value) {
					layout = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					ToggleOption($$renderer, {
						value: 'flame',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Flame`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleOption($$renderer, {
						value: 'icicle',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Icicle`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				disabled: !focused || focused.depth === 0,
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Reset zoom`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Breadcrumb($$renderer, {
				items: breadcrumbItems(),
				class: 'mb-2 flex-nowrap overflow-x-auto',
				$$slots: {
					item: ($$renderer, { item }) => {
						Button($$renderer, {
							slot: 'item',
							base: true,
							class: 'px-2 py-1 rounded-sm shrink-0 whitespace-nowrap',
							children: ($$renderer) => {
								$$renderer.push(`<div class="text-left"><div class="text-sm">${$.escape(item.data.name)}</div> <div class="text-xs text-surface-content/50">${$.escape(format(item.value ?? 0, 'integer'))} · ${$.escape(format((item.value ?? 0) / totalValue, 'percent'))}</div></div>`);
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
						children: ($$renderer) => {
							{
								function children($$renderer, { xScale }) {
									ChartClipPath($$renderer, {
										children: ($$renderer) => {
											{
												function children($$renderer, { nodes }) {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(nodes);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let node = each_array[$$index];
														const x0 = Math.max(0, Math.min(context.width, xScale(node.x0)));
														const x1 = Math.max(0, Math.min(context.width, xScale(node.x1)));
														const nodeWidth = x1 - x0;

														if (nodeWidth > 0.25) {
															$$renderer.push('<!--[0-->');

															const id = nodeId(node);
															const hovered = hoveredId === id;
															const row = layout === 'flame' ? root.height - node.depth : node.depth;

															Group($$renderer, {
																x: x0,
																y: row * rowHeight,
																onclick: () => focused = node,
																onpointermove: (e) => {
																	hoveredId = id;
																	context.tooltip.show(e, node);
																},

																onpointerleave: () => {
																	hoveredId = undefined;
																	context.tooltip.hide();
																},
																class: 'cursor-pointer',
																children: ($$renderer) => {
																	Rect($$renderer, {
																		width: nodeWidth,
																		height: barHeight,
																		rx: 2,
																		fill: context.cGet(node.data),
																		class: hovered ? 'stroke-black/50' : 'stroke-surface-200'
																	});

																	$$renderer.push(`<!----> `);

																	if (nodeWidth > 26) {
																		$$renderer.push('<!--[0-->');

																		RectClipPath($$renderer, {
																			width: nodeWidth - 4,
																			height: barHeight,
																			children: ($$renderer) => {
																				Text($$renderer, {
																					value: node.data.name,
																					x: 5,
																					y: barHeight / 2,
																					verticalAnchor: 'middle',
																					class: 'text-[11px] fill-black pointer-events-none'
																				});
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													}

													$$renderer.push(`<!--]-->`);
												}

												Partition($$renderer, {
													hierarchy: root,
													size: [1, 1],
													get nodes() {
														return nodes;
													},

													set nodes($$value) {
														nodes = $$value;
														$$settled = false;
													},
													children,
													$$slots: { default: true }
												});
											}
										},
										$$slots: { default: true }
									});
								}

								Bounds($$renderer, {
									domain: { x0: focused?.x0 ?? 0, x1: focused?.x1 ?? 1 },
									motion: { type: 'tween', duration: 500, easing: cubicOut },
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
							const self = data.data.value ?? 0;
							const total = data.value ?? 0;

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

											Tooltip.Item($$renderer, {
												label: 'Total',
												value: `${$.stringify(format(total, 'integer'))} (${$.stringify(format(total / totalValue, 'percent'))})`
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
												label: 'Self',
												value: `${$.stringify(format(self, 'integer'))} (${$.stringify(format(self / totalValue, 'percent'))})`
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Depth', value: data.depth, format: 'integer' });
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

				Chart($$renderer, {
					height: chartHeight,
					c: (d) => nameHash(d.name),
					cScale: scaleSequential(interpolateYlOrRd),
					cDomain: [-0.6, 1.6],
					children,
					$$slots: { default: true }
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