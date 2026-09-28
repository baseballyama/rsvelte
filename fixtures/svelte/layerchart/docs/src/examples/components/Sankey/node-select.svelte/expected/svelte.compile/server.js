import * as $ from 'svelte/internal/server';
import { Chart, Group, Link, Rect, Layer, Text, sankeyGraphFromNode } from 'layerchart';
import { Sankey } from 'layerchart/graph';
import { getGreenhouseGraph } from '$lib/graph.remote';

const data = await getGreenhouseGraph();

export default function Node_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedNode = null;

		Chart($$renderer, {
			data: selectedNode ? sankeyGraphFromNode(selectedNode) : data,
			flatData: [],
			height: 600,
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
										strokeWidth: link.width,
										motion: 'tween',
										class: 'stroke-surface-content/10'
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
										onclick: () => {
											if (selectedNode) {
												selectedNode = node.name === selectedNode.name || node.sourceLinks?.length === 0 ? null : node;
											} else {
												selectedNode = node;
											}
										},

										children: ($$renderer) => {
											Rect($$renderer, {
												width: nodeWidth,
												height: nodeHeight,
												class: 'fill-primary hover:fill-primary/90 hover:cursor-pointer',
												motion: 'tween'
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												value: node.name,
												x: node.height === 0 ? -4 : nodeWidth + 4,
												y: nodeHeight / 2,
												textAnchor: node.height === 0 ? 'end' : 'start',
												verticalAnchor: 'middle',
												class: 'select-none'
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Sankey($$renderer, {
								nodeId: (d) => d.name,
								nodeWidth: 8,
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

		$.bind_props($$props, { data });
	});
}