import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
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

let data = await getFlare();
var root = $.from_html(`<div class="text-left"><div class="text-sm"> </div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_1 = $.from_svg(`<g><!><!><!></g>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Vertical($$anchor, $$props) {
	$.push($$props, true);

	let colorBy = $.state('children');
	let padding = $.state(0);
	let round = $.state(false);
	let fullSizeLeafNodes = $.state(false);
	const hierarchy = d3Hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc'));
	let nodes = $.state($.proxy([]));
	let selected = $.state(void 0); // select root initially
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

	const breadcrumbItems = $.derived(() => $.get(selected)
		? $.get(selected)?.ancestors().reverse()
		: $.get(nodes)[0]?.ancestors().reverse() ?? []);

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

	PartitionControls(node_1, {
		get padding() {
			return $.get(padding);
		},

		set padding($$value) {
			$.set(padding, $$value, true);
		},

		get fullSizeLeafNodes() {
			return $.get(fullSizeLeafNodes);
		},

		set fullSizeLeafNodes($$value) {
			$.set(fullSizeLeafNodes, $$value, true);
		},

		get round() {
			return $.get(round);
		},

		set round($$value) {
			$.set(round, $$value, true);
		},

		get colorBy() {
			return $.get(colorBy);
		},

		set colorBy($$value) {
			$.set(colorBy, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Breadcrumb(node_2, {
		get items() {
			return $.get(breadcrumbItems);
		},
		class: 'mb-2',
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

	var node_3 = $.sibling(node_2, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

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
												const nodeWidth = $.derived(() => xScale()($.get(node).x1) - xScale()($.get(node).x0));

												const nodeHeight = $.derived(() => $.get(node).children || !$.get(fullSizeLeafNodes)
													? yScale()($.get(node).y1) - yScale()($.get(node).y0)
													: context().height - yScale()($.get(node).y0));

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
														onclick: () => $.set(selected, $.get(node), true),
														children: ($$anchor, $$slotProps) => {
															RectClipPath($$anchor, {
																get width() {
																	return $.get(nodeWidth);
																},

																get height() {
																	return $.get(nodeHeight);
																},

																children: ($$anchor, $$slotProps) => {
																	const nodeColor = $.derived(() => getNodeColor($.get(node), $.get(colorBy)));
																	var g = root_1();
																	var node_5 = $.child(g);

																	{
																		let $0 = $.derived(() => $.get(colorBy) === 'children'
																			? 'var(--color-primary-content)'
																			: hsl($.get(nodeColor)).darker(1).toString());

																		let $1 = $.derived(() => $.get(colorBy) === 'children' ? 0.2 : 1);

																		Rect(node_5, {
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

																	var node_6 = $.sibling(node_5);

																	{
																		let $0 = $.derived(() => cls('text-[10px] font-medium', $.get(colorBy) === 'children' ? 'fill-primary-content' : 'fill-black'));

																		Text(node_6, {
																			get value() {
																				return $.get(node).data.name;
																			},

																			get class() {
																				return $.get($0);
																			},
																			verticalAnchor: 'start',
																			x: 4,
																			y: 2
																		});
																	}

																	var node_7 = $.sibling(node_6);

																	{
																		let $0 = $.derived(() => format($.get(node).value ?? 0, 'integer'));
																		let $1 = $.derived(() => cls('text-[8px] font-extralight', $.get(colorBy) === 'children' ? 'fill-primary-content' : 'fill-black'));

																		Text(node_7, {
																			get value() {
																				return $.get($0);
																			},

																			get class() {
																				return $.get($1);
																			},
																			verticalAnchor: 'start',
																			x: 4,
																			y: 16
																		});
																	}

																	$.reset(g);
																	$.transition(3, g, () => fade, () => ({ duration: 600 }));
																	$.append($$anchor, g);
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

										Partition($$anchor, {
											get hierarchy() {
												return hierarchy;
											},
											orientation: 'vertical',
											get padding() {
												return $.get(padding);
											},

											get round() {
												return $.get(round);
											},

											get nodes() {
												return $.get(nodes);
											},

											set nodes($$value) {
												$.set(nodes, $$value, true);
											},
											children,
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						};

						let $0 = $.derived(() => ({
							x0: $.get(selected)?.x0,
							y0: $.get(selected)?.y0,
							x1: $.get(selected)?.x1
						}));

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
		};

		Chart(node_3, { height: 600, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}