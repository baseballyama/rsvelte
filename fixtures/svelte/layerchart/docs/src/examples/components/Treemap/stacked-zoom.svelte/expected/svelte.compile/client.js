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
	asAny,
	findAncestor,
	isNodeVisible
} from 'layerchart';

import { Treemap } from 'layerchart/hierarchy';

let data = await getFlare();
var root = $.from_html(`<div class="text-left"><div class="text-sm"> </div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_1 = $.from_svg(`<g><!><!><!></g>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Stacked_zoom($$anchor, $$props) {
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

	var $$exports = {
		get data() {
			return data;
		},

		set data($$value) {
			data = $$value;
		}
	};

	var fragment = root_2();
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

	Chart(node_3, {
		height: 600,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
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
											var node_4 = $.first_child(fragment_6);

											$.each(node_4, 17, nodes, $.index, ($$anchor, node) => {
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
														children: ($$anchor, $$slotProps) => {
															const nodeWidth = $.derived(() => xScale()($.get(node).x1) - xScale()($.get(node).x0));
															const nodeHeight = $.derived(() => yScale()($.get(node).y1) - yScale()($.get(node).y0));

															RectClipPath($$anchor, {
																get width() {
																	return $.get(nodeWidth);
																},

																get height() {
																	return $.get(nodeHeight);
																},

																children: ($$anchor, $$slotProps) => {
																	const nodeColor = $.derived(() => getNodeColor($.get(node), $.get(config).colorBy));
																	var fragment_9 = $.comment();
																	var node_5 = $.first_child(fragment_9);

																	{
																		var consequent = ($$anchor) => {
																			var g = root_1();
																			var node_6 = $.child(g);

																			{
																				let $0 = $.derived(() => $.get(config).colorBy === 'children'
																					? 'var(--color-primary-content)'
																					: hsl($.get(nodeColor)).darker(1).toString());

																				let $1 = $.derived(() => $.get(config).colorBy === 'children' ? 0.2 : 1);

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
																					rx: 5
																				});
																			}

																			var node_7 = $.sibling(node_6);

																			{
																				let $0 = $.derived(() => $.get(node).data.name);
																				let $1 = $.derived(() => $.get(node).children?.length ?? 0);
																				let $2 = $.derived(() => cls('text-[10px] font-medium', $.get(config).colorBy === 'children' ? 'fill-primary-content' : 'fill-black'));

																				Text(node_7, {
																					get value() {
																						return `${$.get($0) ?? ''} (${$.get($1) ?? ''})`;
																					},

																					get class() {
																						return $.get($2);
																					},
																					verticalAnchor: 'start',
																					lineHeight: '10px',
																					x: 4,
																					y: 3.6
																				});
																			}

																			var node_8 = $.sibling(node_7);

																			{
																				let $0 = $.derived(() => format($.get(node).value ?? 0, 'integer'));
																				let $1 = $.derived(() => cls('text-[8px] font-extralight', $.get(config).colorBy === 'children' ? 'fill-primary-content' : 'fill-black'));

																				Text(node_8, {
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

																			$.reset(g);
																			$.transition(3, g, () => fade, () => ({ duration: 600 }));
																			$.append($$anchor, g);
																		};

																		var d_1 = $.derived(() => isNodeVisible($.get(node), nodes().find((n) => n.data.name === $.get(selected).data.name && n.depth === $.get(selected).depth)));

																		$.if(node_5, ($$render) => {
																			if ($.get(d_1)) $$render(consequent);
																		});
																	}

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															});
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
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}