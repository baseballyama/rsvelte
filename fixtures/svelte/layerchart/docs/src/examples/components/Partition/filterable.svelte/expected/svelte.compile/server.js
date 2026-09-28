import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import { rollup } from 'd3-array';

import {
	Bounds,
	Chart,
	ChartClipPath,
	Group,
	Rect,
	RectClipPath,
	Text,
	Layer,
	findAncestor
} from 'layerchart';

import { Partition } from 'layerchart/hierarchy';
import { Breadcrumb, Button } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import PartitionControls from '$lib/components/controls/PartitionControls.svelte';
import { getCars } from '$lib/data.remote';

let data = await getCars();

export default function Filterable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let colorBy = 'children';
		let padding = 0;
		let round = false;
		let fullSizeLeafNodes = false;
		let hierarchy = $.derived(() => d3Hierarchy(getGrouped()).count());
		let nodes = [];
		let selected = void 0;
		let isFiltered = false;

		function getGrouped(selected) {
			return rollup(
				data.// Limit dataset
				filter((d) => [
					'BMW',
					'Chevrolet',
					'Dodge',
					'Ford',
					'Honda',
					'Toyota',
					'Volkswagen'
				].includes(d.make)).// Hide some models in each group to show transitions
				filter((d) => isFiltered ? d.year > 2010 : true).// Apply `make` selection
				filter((d) => {
					if (selected && selected?.depth === 1) {
						return d.make === selected.data[0];
					} else {
						return true;
					}
				}),
				(items) => items[0], //.slice(0, 3),
				(d) => d.make,
				(d) => d.model
			);
			// d => d.year,
		}

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
				},

				get isFiltered() {
					return isFiltered;
				},

				set isFiltered($$value) {
					isFiltered = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Breadcrumb($$renderer, {
				items: breadcrumbItems(),
				$$slots: {
					item: ($$renderer, { item }) => {
						Button($$renderer, {
							slot: 'item',
							base: true,
							class: 'px-2 py-1 rounded-sm',
							children: ($$renderer) => {
								$$renderer.push(`<div class="text-left"><div class="text-sm">${$.escape(item.data[0] ?? 'Overall')}</div> <div class="text-xs text-surface-content/50">${$.escape(format(item.value ?? 0, 'integer'))}</div></div>`);
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

														$$renderer.push(`<g>`);

														Group($$renderer, {
															x: xScale(node.y0),
															y: yScale(node.x0),
															onclick: () => selected = node,
															motion: { type: 'tween', delay: 600 },
															children: ($$renderer) => {
																const nodeWidth = xScale(node.y1) - xScale(node.y0);
																const nodeHeight = yScale(node.x1) - yScale(node.x0);
																const nodeColor = getNodeColor(node, colorBy);

																Rect($$renderer, {
																	width: nodeWidth,
																	height: nodeHeight,
																	stroke: colorBy === 'children'
																		? 'var(--color-primary-content)'
																		: hsl(nodeColor).darker(1).toString(),
																	strokeOpacity: colorBy === 'children' ? 0.2 : 1,
																	fill: nodeColor,
																	rx: 5,
																	motion: { type: 'tween', delay: 600 }
																});

																$$renderer.push(`<!---->`);

																RectClipPath($$renderer, {
																	width: nodeWidth,
																	height: nodeHeight,
																	motion: { type: 'tween', delay: 600 },
																	children: ($$renderer) => {
																		Text($$renderer, {
																			segments: [
																				{
																					value: node.data[0] ?? 'Overall',
																					class: cls('text-[10px] font-medium', colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																				},

																				...node.children
																					? [
																						{
																							value: ` ${format(node.value ?? 0, 'integer')}`,
																							class: cls('text-[8px] font-extralight', colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																						}
																					]
																					: []
																			],
																			verticalAnchor: 'start',
																			lineHeight: '10px',
																			x: 4,
																			y: 3.6
																		});
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!---->`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----></g>`);
													}

													$$renderer.push(`<!--]-->`);
												}

												Partition($$renderer, {
													hierarchy: hierarchy(),
													padding,
													round,
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