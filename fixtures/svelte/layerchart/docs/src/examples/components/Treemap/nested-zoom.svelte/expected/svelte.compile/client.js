import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
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
	Tooltip,
	asAny,
	findAncestor
} from 'layerchart';

import { Treemap } from 'layerchart/hierarchy';

let data = await getFlare();
var root = $.from_html(`<div class="text-left"><div class="text-sm"> </div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_1 = $.from_svg(`<!><!>`, 1);
var root_2 = $.from_svg(`<g><!><!></g>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Nested_zoom($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		tile: 'squarify',
		colorBy: 'children',
		maintainAspectRatio: false,
		paddingOuter: 4,
		paddingInner: 4,
		paddingTop: 20,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0
	}));

	const hierarchy = d3Hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc'));
	let selected = $.state($.proxy(hierarchy.copy()));
	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);

	const ordinalColor = scaleOrdinal(
		// filter out hard to see yellow and green
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
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

	var $$exports = {
		get data() {
			return data;
		},

		set data($$value) {
			data = $$value;
		}
	};

	var fragment = root_4();
	var node_1 = $.first_child(fragment);

	TreemapControls(node_1, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $.get(selected)?.ancestors().reverse() ?? []);

		Breadcrumb(node_2, {
			get items() {
				return $.get($0);
			},
			class: 'my-2',
			$$slots: {
				item: ($$anchor, $$slotProps) => {
					const item = $.derived(() => $$slotProps.item);

					Button($$anchor, {
						slot: 'item',
						base: true,
						class: 'px-2 py-1 rounded-sm',
						$$events: { click: () => $.set(selected, $.get(item), true) },
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								var div = root();
								var div_1 = $.child(div);
								var text = $.only_child(div_1, true);
								var div_2 = $.sibling(div_1, 2);
								var text_1 = $.only_child(div_2, true);

								$.reset(div);

								$.template_effect(
									($0) => {
										$.set_text(text, $.get(item).data.name);
										$.set_text(text_1, $0);
									},
									[() => format($.get(item).value ?? 0, 'integer')]
								);

								$.append($$anchor, div);
							}
						}
					});
				}
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_2 = root_3();
			var node_4 = $.first_child(fragment_2);

			Layer(node_4, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let xScale = () => ($$arg0?.()).xScale;
							let yScale = () => ($$arg0?.()).yScale;

							ChartClipPath($$anchor, {
								children: ($$anchor, $$slotProps) => {
									{
										const children = ($$anchor, $$arg0) => {
											let nodes = () => ($$arg0?.()).nodes;
											var fragment_6 = $.comment();
											var node_5 = $.first_child(fragment_6);

											$.each(node_5, 17, nodes, $.index, ($$anchor, node) => {
												{
													let $0 = $.derived(() => xScale()($.get(node).x0));
													let $1 = $.derived(() => yScale()($.get(node).y0));

													Group($$anchor, {
														get x() {
															return $.get($0);
														},

														get y() {
															return $.get($1);
														},
														onclick: () => $.get(node).children ? $.set(selected, $.get(node), true) : null,
														onpointermove: (e) => context().tooltip.show(e, $.get(node)),
														get onpointerleave() {
															return context().tooltip.hide;
														},

														children: ($$anchor, $$slotProps) => {
															const nodeWidth = $.derived(() => xScale()($.get(node).x1) - xScale()($.get(node).x0));
															const nodeHeight = $.derived(() => yScale()($.get(node).y1) - yScale()($.get(node).y0));
															const nodeColor = $.derived(() => getNodeColor($.get(node), $.get(config).colorBy));
															var g = root_2();
															var node_6 = $.child(g);

															{
																let $0 = $.derived(() => $.get(config).colorBy === 'children'
																	? 'var(--color-primary-content)'
																	: hsl($.get(nodeColor)).darker(1).toString());

																let $1 = $.derived(() => $.get(config).colorBy === 'children' ? 0.2 : 1);
																let $2 = $.derived(() => $.get(node).children ? 0.5 : 1);

																Rect(node_6, {
																	get width() {
																		return $.get(nodeWidth);
																	},

																	get height() {
																		return $.get(nodeHeight);
																	},

																	get stroke() {
																		return $.get($0);
																	},

																	get strokeOpacity() {
																		return $.get($1);
																	},

																	get fill() {
																		return $.get(nodeColor);
																	},

																	get fillOpacity() {
																		return $.get($2);
																	},
																	rx: 5
																});
															}

															var node_7 = $.sibling(node_6);

															RectClipPath(node_7, {
																get width() {
																	return $.get(nodeWidth);
																},

																get height() {
																	return $.get(nodeHeight);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = root_1();
																	var node_8 = $.first_child(fragment_8);

																	{
																		let $0 = $.derived(() => [
																			{
																				value: $.get(node).data.name,
																				class: cls('text-[10px] font-medium', $.get(config).colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																			},

																			...$.get(node).children
																				? [
																					{
																						value: ` ${format($.get(node).value ?? 0, 'integer')}`,
																						class: cls('text-[8px] font-extralight', $.get(config).colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																					}
																				]
																				: []
																		]);

																		Text(node_8, {
																			get segments() {
																				return $.get($0);
																			},
																			verticalAnchor: 'start',
																			lineHeight: '10px',
																			x: 4,
																			y: 3.6
																		});
																	}

																	var node_9 = $.sibling(node_8);

																	{
																		var consequent = ($$anchor) => {
																			{
																				let $0 = $.derived(() => format($.get(node).value ?? 0, 'integer'));
																				let $1 = $.derived(() => cls('text-[8px] font-extralight', $.get(config).colorBy === 'children' ? 'fill-primary-content' : 'fill-black'));

																				Text($$anchor, {
																					get value() {
																						return $.get($0);
																					},

																					get class() {
																						return $.get($1);
																					},
																					verticalAnchor: 'start',
																					lineHeight: '8px',
																					x: 4,
																					y: 16
																				});
																			}
																		};

																		$.if(node_9, ($$render) => {
																			if (!$.get(node).children) $$render(consequent);
																		});
																	}

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});

															$.reset(g);
															$.transition(3, g, () => fade, () => ({ duration: 600 }));
															$.append($$anchor, g);
														},
														$$slots: { default: true }
													});
												}
											});

											$.append($$anchor, fragment_6);
										};

										Treemap($$anchor, {
											get hierarchy() {
												return hierarchy;
											},

											get tile() {
												return $.get(config).tile;
											},

											get paddingOuter() {
												return $.get(config).paddingOuter;
											},

											get paddingInner() {
												return $.get(config).paddingInner;
											},

											get paddingTop() {
												return $.get(config).paddingTop;
											},

											get paddingBottom() {
												return $.get(config).paddingBottom;
											},

											get paddingLeft() {
												return $.get(config).paddingLeft;
											},

											get paddingRight() {
												return $.get(config).paddingRight;
											},

											get maintainAspectRatio() {
												return $.get(config).maintainAspectRatio;
											},
											children,
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						};

						let $0 = $.derived(() => asAny($.get(selected)));
						let $1 = $.derived(() => ({ type: 'tween', duration: 800, easing: cubicOut }));

						Bounds($$anchor, {
							get domain() {
								return $.get($0);
							},

							get motion() {
								return $.get($1);
							},
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_4, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_10 = root_3();
					var node_11 = $.first_child(fragment_10);

					$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, data().data.name));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = $.comment();
								var node_13 = $.first_child(fragment_12);

								$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_10);
				};

				$.component(node_10, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_2);
		};

		Chart(node_3, { height: 800, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}