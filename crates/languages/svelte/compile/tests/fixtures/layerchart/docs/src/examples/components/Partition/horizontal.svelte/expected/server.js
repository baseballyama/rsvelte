import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { fade } from 'svelte/transition';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { hsl } from 'd3-color';

import {
	Bounds,
	Chart,
	ChartClipPath,
	Group,
	Rect,
	RectClipPath,
	Layer,
	Text,
	findAncestor
} from 'layerchart';

import { Partition } from 'layerchart/hierarchy';
import { Breadcrumb, Button } from 'svelte-ux';
import { format, sortFunc } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import PartitionControls from '$lib/components/controls/PartitionControls.svelte';
import { getFlare } from '$lib/data.remote';

let data = await getFlare();

export default function Horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let colorBy = 'children';
		let padding = 0;
		let round = false;
		let fullSizeLeafNodes = false;
		const hierarchy = d3Hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc'));
		let nodes = [];
		let selected = void 0; // select root initially
		const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);

		const ordinalColor = scaleOrdinal(
			// filter out hard to see yellow and green
			chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
		);

		function getNodeColor(node, colorBy) {
			switch (colorBy) {
				case 'children':
					return node.children ? 'var(--color-primary)' : 'var(--color-primary-600)';

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

		const breadcrumbItems = $.derived(() => selected
			? selected?.ancestors().reverse()
			: nodes[0]?.ancestors().reverse() ?? []);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PartitionControls($$renderer, {
				get padding() {
					return padding;
				},

				set padding($$value) {
					padding = $$value;
					$$settled = false;
				},

				get fullSizeLeafNodes() {
					return fullSizeLeafNodes;
				},

				set fullSizeLeafNodes($$value) {
					fullSizeLeafNodes = $$value;
					$$settled = false;
				},

				get round() {
					return round;
				},

				set round($$value) {
					round = $$value;
					$$settled = false;
				},

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
				items: breadcrumbItems(),
				class: 'mb-2',
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

														const nodeWidth = node.children || !fullSizeLeafNodes
															? xScale(node.y1) - xScale(node.y0)
															: context.width - xScale(node.y0);

														const nodeHeight = yScale(node.x1) - yScale(node.x0);

														Group($$renderer, {
															x: xScale(node.y0),
															y: yScale(node.x0),
															onclick: () => selected = node,
															children: ($$renderer) => {
																RectClipPath($$renderer, {
																	width: nodeWidth,
																	height: nodeHeight,
																	children: ($$renderer) => {
																		const nodeColor = getNodeColor(node, colorBy);

																		$$renderer.push(`<g>`);

																		Rect($$renderer, {
																			width: nodeWidth,
																			height: nodeHeight,
																			stroke: colorBy === 'children'
																				? 'var(--color-primary-content)'
																				: hsl(nodeColor).darker(1).toString(),
																			strokeOpacity: colorBy === 'children' ? 0.2 : 1,
																			fill: nodeColor,
																			rx: 5
																		});

																		$$renderer.push(`<!---->`);

																		Text($$renderer, {
																			segments: [
																				{
																					value: node.data.name,
																					class: cls('text-[10px] font-medium', colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																				},

																				{
																					value: ` ${format(node.value ?? 0, 'integer')}`,
																					class: cls('text-[8px] font-extralight', colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																				}
																			],
																			verticalAnchor: 'start',
																			lineHeight: '10px',
																			x: 4,
																			y: 3.6
																		});

																		$$renderer.push(`<!----></g>`);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!--]-->`);
												}

												Partition($$renderer, {
													padding,
													round,
													hierarchy,
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
									domain: { x0: selected?.y0, y0: selected?.x0, y1: selected?.x1 },
									motion: { type: 'tween', duration: 800, easing: cubicOut },
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				}

				Chart($$renderer, { height: 600, children, $$slots: { default: true } });
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