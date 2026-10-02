import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { fade } from 'svelte/transition';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import TreemapControls from '$lib/components/controls/TreemapControls.svelte';
import { Button, Breadcrumb } from 'svelte-ux';
import { format, sortFunc } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';

import {
	Bounds,
	Chart,
	ChartClipPath,
	Group,
	Rect,
	RectClipPath,
	Layer,
	Text,
	asAny,
	findAncestor,
	isNodeVisible
} from 'layerchart';

import { Treemap } from 'layerchart/hierarchy';
import { getFlare } from '$lib/data.remote';

let data = await getFlare();

export default function Stacked_zoom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			tile: 'squarify',
			colorBy: 'children',
			maintainAspectRatio: false,
			paddingOuter: 4,
			paddingInner: 4,
			paddingTop: 20,
			paddingBottom: 0,
			paddingLeft: 0,
			paddingRight: 0
		};

		const hierarchy = d3Hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc'));
		let selected = hierarchy.copy();
		const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
		const ordinalColor = scaleOrdinal(chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
		);

		function getNodeColor(node, colorBy) {
			switch (colorBy) {
				case 'children':
					return node.children
						? 'var(--color-primary-500)'
						: 'var(--color-primary-400)';

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
			TreemapControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
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

			Chart($$renderer, {
				height: 600,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { xScale, yScale }) {
									ChartClipPath($$renderer, {
										children: ($$renderer) => {
											{
												function children($$renderer, { nodes }) {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(nodes);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let node = each_array[$$index];

														Group($$renderer, {
															x: xScale(node.x0),
															y: yScale(node.y0),
															onclick: () => node.children ? selected = node : null,
															children: ($$renderer) => {
																const nodeWidth = xScale(node.x1) - xScale(node.x0);
																const nodeHeight = yScale(node.y1) - yScale(node.y0);

																RectClipPath($$renderer, {
																	width: nodeWidth,
																	height: nodeHeight,
																	children: ($$renderer) => {
																		const nodeColor = getNodeColor(node, config.colorBy);

																		if (isNodeVisible(node, nodes.find((n) => n.data.name === selected.data.name && n.depth === selected.depth))) {
																			$$renderer.push(`<!--[0--><g>`);

																			Rect($$renderer, {
																				width: nodeWidth,
																				height: nodeHeight,
																				stroke: config.colorBy === 'children'
																					? 'var(--color-primary-content)'
																					: hsl(nodeColor).darker(1).toString(),
																				strokeOpacity: config.colorBy === 'children' ? 0.2 : 1,
																				fill: nodeColor,
																				rx: 5
																			});

																			$$renderer.push(`<!---->`);

																			Text($$renderer, {
																				value: `${$.stringify(node.data.name)} (${$.stringify(node.children?.length ?? 0)})`,
																				class: cls('text-[10px] font-medium', config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black'),
																				verticalAnchor: 'start',
																				lineHeight: '10px',
																				x: 4,
																				y: 3.6
																			});

																			$$renderer.push(`<!---->`);

																			Text($$renderer, {
																				value: format(node.value ?? 0, 'integer'),
																				class: cls('text-[8px] font-extralight', config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black'),
																				verticalAnchor: 'start',
																				lineHeight: '8px',
																				x: 4,
																				y: 16
																			});

																			$$renderer.push(`<!----></g>`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]-->`);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!--]-->`);
												}

												Treemap($$renderer, {
													hierarchy,
													tile: config.tile,
													maintainAspectRatio: config.maintainAspectRatio,
													children,
													$$slots: { default: true }
												});
											}
										},
										$$slots: { default: true }
									});
								}

								Bounds($$renderer, {
									domain: asAny(selected),
									motion: { type: 'tween', duration: 800, easing: cubicOut },
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

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