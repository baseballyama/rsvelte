import 'svelte/internal/disclose-version';
import { getComplexGraph } from '$lib/graph.remote';
import * as $ from 'svelte/internal/client';
import { scaleSequential } from 'd3-scale';
import { interpolateCool } from 'd3-scale-chromatic';
import { extent } from 'd3-array';
import { Icon } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import LucideArrowRight from '~icons/lucide/arrow-right';
import { Chart, Group, Link, Rect, Layer, Text, Tooltip } from 'layerchart';
import { Sankey } from 'layerchart/graph';
import SankeyControls from '$lib/components/controls/SankeyControls.svelte';

const data = await getComplexGraph();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!> `, 1);
var root_2 = $.from_html(`<!> <div class="col-span-full text-sm">Sources</div> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="col-span-full text-sm">Targets</div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Complex($$anchor, $$props) {
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

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			Layer(node_3, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let links = () => ($$arg0?.()).links;
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, links, (link) => [link.source.name, link.target.name, link.value].join('-'), ($$anchor, link) => {
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
										onpointermove: (e) => context().tooltip.show(e, { link: $.get(link) }),
										onpointerleave: () => {
											$.set(highlightLinkIndexes, [], true);
											context().tooltip.hide();
										},
										motion: 'tween'
									});
								}
							});

							var node_5 = $.sibling(node_4, 2);

							$.each(node_5, 17, nodes, (node) => node.name, ($$anchor, node) => {
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
										var node_6 = $.first_child(fragment_6);

										{
											let $0 = $.derived(() => colorScale($.get(node)[$.get(config).nodeColorBy]));

											Rect(node_6, {
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
												onpointermove: (e) => context().tooltip.show(e, { node: $.get(node) }),
												onpointerleave: () => {
													$.set(highlightLinkIndexes, [], true);
													context().tooltip.hide();
												},
												motion: 'tween'
											});
										}

										var node_7 = $.sibling(node_6, 2);

										{
											let $0 = $.derived(() => $.get(nodeWidth) + 4);
											let $1 = $.derived(() => $.get(nodeHeight) / 2);

											Text(node_7, {
												get value() {
													return $.get(node).name;
												},

												get x() {
													return $.get($0);
												},

												get y() {
													return $.get($1);
												},
												dy: -2,
												verticalAnchor: 'middle',
												class: 'pointer-events-none text-[10px]'
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

			var node_8 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_7 = root();
					var node_9 = $.first_child(fragment_7);

					$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = $.comment();
								var node_10 = $.first_child(fragment_8);

								{
									var consequent = ($$anchor) => {
										var text = $.text();

										$.template_effect(() => $.set_text(text, data().node.name));
										$.append($$anchor, text);
									};

									var consequent_1 = ($$anchor) => {
										var fragment_10 = root_1();
										var text_1 = $.first_child(fragment_10);
										var node_11 = $.sibling(text_1);

										Icon(node_11, {
											get data() {
												return LucideArrowRight;
											},
											class: 'text-white/50'
										});

										var text_2 = $.sibling(node_11);

										$.template_effect(() => {
											$.set_text(text_1, `${data().link.source.name ?? ''} `);
											$.set_text(text_2, ` ${data().link.target.name ?? ''}`);
										});

										$.append($$anchor, fragment_10);
									};

									$.if(node_10, ($$render) => {
										if (data().node) $$render(consequent); else if (data().link) $$render(consequent_1, 1);
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_9, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_11 = $.comment();
								var node_13 = $.first_child(fragment_11);

								{
									var consequent_4 = ($$anchor) => {
										var fragment_12 = root_4();
										var node_14 = $.first_child(fragment_12);

										$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												label: 'Total',
												get value() {
													return data().node.value;
												},
												format: 'decimal'
											});
										});

										var node_15 = $.sibling(node_14, 2);

										{
											var consequent_2 = ($$anchor) => {
												var fragment_13 = root_2();
												var node_16 = $.first_child(fragment_13);

												$.component(node_16, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
													Tooltip_Separator($$anchor, {});
												});

												var node_17 = $.sibling(node_16, 4);

												$.each(node_17, 17, () => data().node.targetLinks, $.index, ($$anchor, link) => {
													var fragment_14 = $.comment();
													var node_18 = $.first_child(fragment_14);

													$.component(node_18, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
														Tooltip_Item_1($$anchor, {
															get label() {
																return $.get(link).source.name;
															},

															get value() {
																return $.get(link).value;
															},
															format: 'decimal'
														});
													});

													$.append($$anchor, fragment_14);
												});

												$.append($$anchor, fragment_13);
											};

											$.if(node_15, ($$render) => {
												if (data().node.targetLinks.length) $$render(consequent_2);
											});
										}

										var node_19 = $.sibling(node_15, 2);

										{
											var consequent_3 = ($$anchor) => {
												var fragment_15 = root_3();
												var node_20 = $.first_child(fragment_15);

												$.component(node_20, () => Tooltip.Separator, ($$anchor, Tooltip_Separator_1) => {
													Tooltip_Separator_1($$anchor, {});
												});

												var node_21 = $.sibling(node_20, 4);

												$.each(node_21, 17, () => data().node.sourceLinks, $.index, ($$anchor, link) => {
													var fragment_16 = $.comment();
													var node_22 = $.first_child(fragment_16);

													$.component(node_22, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
														Tooltip_Item_2($$anchor, {
															get label() {
																return $.get(link).target.name;
															},

															get value() {
																return $.get(link).value;
															},
															format: 'decimal'
														});
													});

													$.append($$anchor, fragment_16);
												});

												$.append($$anchor, fragment_15);
											};

											$.if(node_19, ($$render) => {
												if (data().node.sourceLinks.length) $$render(consequent_3);
											});
										}

										$.append($$anchor, fragment_12);
									};

									var consequent_5 = ($$anchor) => {
										var fragment_17 = $.comment();
										var node_23 = $.first_child(fragment_17);

										$.component(node_23, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
											Tooltip_Item_3($$anchor, {
												label: 'Value',
												get value() {
													return data().link.value;
												},
												format: 'decimal'
											});
										});

										$.append($$anchor, fragment_17);
									};

									$.if(node_13, ($$render) => {
										if (data().node) $$render(consequent_4); else if (data().link) $$render(consequent_5, 1);
									});
								}

								$.append($$anchor, fragment_11);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart(node_2, {
			get data() {
				return data;
			},
			padding: { right: 164 },
			flatData: [],
			height: 800,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}