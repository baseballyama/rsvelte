import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
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

const data = await getFlare();
var root = $.from_html(`<!> <!>`, 1);

export default function Hierarchy($$anchor, $$props) {
	$.push($$props, true);

	const colorScale = scaleSequential(interpolateCool);
	let highlightLinkIndexes = $.state($.proxy([]));

	let config = $.state($.proxy({
		nodeAlign: 'justify',
		nodePadding: 4,
		nodeWidth: 10,
		nodeColorBy: 'layer',
		linkColorBy: 'static'
	}));

	const linkOpacity = $.derived(() => $.get(config).linkColorBy === 'static'
		? { default: 0.1, inactive: 0.01 }
		: { default: 0.2, inactive: 0.01 });

	const hierarchy = $.derived(() => d3Hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc')));
	const graph = $.derived(() => sankeyGraphFromHierarchy($.get(hierarchy)));
	var $$exports = { data };
	var fragment = root();
	var node_1 = $.first_child(fragment);

	SankeyControls(node_1, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Chart(node_2, {
		get data() {
			return $.get(graph);
		},
		padding: { right: 100 },
		flatData: [],
		height: 2000,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let links = () => ($$arg0?.()).links;
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 17, links, (link) => [link.source.data.name, link.target.data.name, link.value].join('-'), ($$anchor, link) => {
								{
									let $0 = $.derived(() => $.get(config).linkColorBy === 'static'
										? undefined
										: colorScale($.get(link)[$.get(config).linkColorBy][$.get(config).nodeColorBy]));

									let $1 = $.derived(() => $.get(highlightLinkIndexes).length && !$.get(highlightLinkIndexes).includes($.get(link).index)
										? $.get(linkOpacity).inactive
										: $.get(linkOpacity).default);

									let $2 = $.derived(() => cls('transition[stroke-opacity] duration-300', $.get(config).linkColorBy === 'static' && 'stroke-surface-content'));

									Link($$anchor, {
										sankey: true,
										get data() {
											return $.get(link);
										},

										get stroke() {
											return $.get($0);
										},

										get strokeOpacity() {
											return $.get($1);
										},

										get strokeWidth() {
											return $.get(link).width;
										},

										get class() {
											return $.get($2);
										},
										onpointerenter: () => $.set(highlightLinkIndexes, [$.get(link).index], true),
										onpointerleave: () => $.set(highlightLinkIndexes, [], true),
										motion: 'tween'
									});
								}
							});

							var node_4 = $.sibling(node_3, 2);

							$.each(node_4, 17, nodes, (node) => [node.data.name, node.value].join('-'), ($$anchor, node) => {
								const nodeWidth = $.derived(() => ($.get(node).x1 ?? 0) - ($.get(node).x0 ?? 0));
								const nodeHeight = $.derived(() => ($.get(node).y1 ?? 0) - ($.get(node).y0 ?? 0));

								Group($$anchor, {
									get x() {
										return $.get(node).x0;
									},

									get y() {
										return $.get(node).y0;
									},
									motion: 'tween',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_5 = $.first_child(fragment_6);

										{
											let $0 = $.derived(() => colorScale($.get(node)[$.get(config).nodeColorBy]));

											Rect(node_5, {
												get width() {
													return $.get(nodeWidth);
												},

												get height() {
													return $.get(nodeHeight);
												},

												get fill() {
													return $.get($0);
												},
												fillOpacity: 0.5,
												onpointerenter: () => {
													$.set(
														highlightLinkIndexes,
														[
															...$.get(node).sourceLinks?.map((l) => l.index) ?? [],
															...$.get(node).targetLinks?.map((l) => l.index) ?? []
														],
														true
													);
												},
												onpointerleave: () => $.set(highlightLinkIndexes, [], true),
												motion: 'tween'
											});
										}

										var node_6 = $.sibling(node_5, 2);

										{
											let $0 = $.derived(() => $.get(nodeWidth) + 4);
											let $1 = $.derived(() => $.get(nodeHeight) / 2);

											Text(node_6, {
												get value() {
													return $.get(node).data.name;
												},

												get x() {
													return $.get($0);
												},

												get y() {
													return $.get($1);
												},
												dy: -2,
												verticalAnchor: 'middle',
												class: 'text-[10px] stroke-surface-100 stroke-2'
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						Sankey($$anchor, {
							get nodeAlign() {
								return $.get(config).nodeAlign;
							},

							get nodePadding() {
								return $.get(config).nodePadding;
							},

							get nodeWidth() {
								return $.get(config).nodeWidth;
							},

							onUpdate: (e) => {
								// Calculate domain extents from Sankey data
								// TODO: Update as 'nodeColorBy' changes
								// @ts-expect-error
								const extents = extent(e.nodes, (d) => d[$.get(config).nodeColorBy]);

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

	$.append($$anchor, fragment);

	return $.pop($$exports);
}