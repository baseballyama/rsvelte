import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { interpolateCool } from 'd3-scale-chromatic';
import { extent } from 'd3-array';
import { sortFunc } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';

import {
	Chart,
	Group,
	Link,
	Rect,
	Layer,
	Text,
	sankeyGraphFromHierarchy
} from 'layerchart';

import { Sankey } from 'layerchart/graph';
import SankeyControls from '$lib/components/controls/SankeyControls.svelte';
import { getFlare } from '$lib/data.remote';

const data = await getFlare();

export default function Hierarchy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorScale = scaleSequential(interpolateCool);
		let highlightLinkIndexes = [];

		let config = {
			nodeAlign: 'justify',
			nodePadding: 4,
			nodeWidth: 10,
			nodeColorBy: 'layer',
			linkColorBy: 'static'
		};

		const linkOpacity = $.derived(() => config.linkColorBy === 'static'
			? { default: 0.1, inactive: 0.01 }
			: { default: 0.2, inactive: 0.01 });

		const hierarchy = $.derived(() => d3Hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc')));
		const graph = $.derived(() => sankeyGraphFromHierarchy(hierarchy()));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SankeyControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data: graph(),
				padding: { right: 100 },
				flatData: [],
				height: 2000,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { links, nodes }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(links);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let link = each_array[$$index];

										Link($$renderer, {
											sankey: true,
											data: link,
											stroke: config.linkColorBy === 'static'
												? undefined
												: colorScale(link[config.linkColorBy][config.nodeColorBy]),
											strokeOpacity: highlightLinkIndexes.length && !highlightLinkIndexes.includes(link.index) ? linkOpacity().inactive : linkOpacity().default,
											strokeWidth: link.width,
											class: cls('transition[stroke-opacity] duration-300', config.linkColorBy === 'static' && 'stroke-surface-content'),
											onpointerenter: () => highlightLinkIndexes = [link.index],
											onpointerleave: () => highlightLinkIndexes = [],
											motion: 'tween'
										});
									}

									$$renderer.push(`<!--]--> <!--[-->`);

									const each_array_1 = $.ensure_array_like(nodes);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let node = each_array_1[$$index_1];
										const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0);
										const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0);

										Group($$renderer, {
											x: node.x0,
											y: node.y0,
											motion: 'tween',
											children: ($$renderer) => {
												Rect($$renderer, {
													width: nodeWidth,
													height: nodeHeight,
													fill: colorScale(node[config.nodeColorBy]),
													fillOpacity: 0.5,
													onpointerenter: () => {
														highlightLinkIndexes = [
															...node.sourceLinks?.map((l) => l.index) ?? [],
															...node.targetLinks?.map((l) => l.index) ?? []
														];
													},
													onpointerleave: () => highlightLinkIndexes = [],
													motion: 'tween'
												});

												$$renderer.push(`<!----> `);

												Text($$renderer, {
													value: node.data.name,
													x: nodeWidth + 4,
													y: nodeHeight / 2,
													dy: -2,
													verticalAnchor: 'middle',
													class: 'text-[10px] stroke-surface-100 stroke-2'
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								}

								Sankey($$renderer, {
									nodeAlign: config.nodeAlign,
									nodePadding: config.nodePadding,
									nodeWidth: config.nodeWidth,
									onUpdate: (e) => {
										// Calculate domain extents from Sankey data
										// TODO: Update as 'nodeColorBy' changes
										// @ts-expect-error
										const extents = extent(e.nodes, (d) => d[config.nodeColorBy]);

										// @ts-expect-error
										colorScale.domain(extents);
									},
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