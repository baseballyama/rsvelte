import 'svelte/internal/disclose-version';
import { getFlameGraph } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';

import {
	Bounds,
	Chart,
	ChartClipPath,
	Group,
	Layer,
	Rect,
	RectClipPath,
	Text,
	Tooltip,
	parseFoldedStacks
} from 'layerchart';

import { Partition } from 'layerchart/hierarchy';
import { Breadcrumb, Button, ToggleGroup, ToggleOption } from 'svelte-ux';
import { format } from '@layerstack/utils';

let data = await getFlameGraph();
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="text-left"><div class="text-sm"> </div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex gap-2 items-center justify-between mb-2 screenshot-hidden"><!> <!></div> <!> <!>`, 1);

export default function Flame_graph($$anchor, $$props) {
	$.push($$props, true);

	const rowHeight = 24;
	const barHeight = rowHeight - 1; // leave a 1px gap between rows

	// `data` is a "folded stacks" profile (see getFlameGraph).  `parseFoldedStacks()` returns a d3
	// `HierarchyNode` where each frame's `value` is its _self_ samples, so `.sum()` accumulates them
	// into inclusive/total samples.
	const root = parseFoldedStacks(data, { rootName: 'all' }).sum((d) => d.value).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	const totalValue = root.value ?? 0;
	const chartHeight = (root.height + 1) * rowHeight;
	let nodes = $.state($.proxy([]));
	let focused = $.state(void 0); // `undefined` = root/full view
	let hoveredId = $.state(void 0);
	let layout = $.state('flame');

	function nodeId(node) {
		return node.ancestors().map((n) => n.data.name).join('/');
	}

	// Color accessor: hash the frame name to a [0,1] value (mapped to a warm color by the
	// `Chart`'s `cScale` — see the `c`/`cScale`/`cDomain` props below)
	function nameHash(name) {
		const maxChar = 6;
		const mod = 10;
		let hash = 0;
		let maxHash = 0;
		let weight = 1;

		for (let i = 0; i < Math.min(name.length, maxChar); i++) {
			hash += weight * (name.charCodeAt(i) % mod);
			maxHash += weight * (mod - 1);
			weight *= 0.7;
		}

		return maxHash > 0 ? hash / maxHash : 0;
	}

	const breadcrumbItems = $.derived(() => $.get(focused)
		? $.get(focused).ancestors().reverse()
		: $.get(nodes)[0]?.ancestors().reverse() ?? []);

	var $$exports = {
		get data() {
			return data;
		},

		set data($$value) {
			data = $$value;
		}
	};

	var fragment = root_4();
	var div = $.first_child(fragment);
	var node_1 = $.child(div);

	ToggleGroup(node_1, {
		variant: 'outline',
		size: 'sm',
		inset: true,
		get value() {
			return $.get(layout);
		},

		set value($$value) {
			$.set(layout, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			ToggleOption(node_2, {
				value: 'flame',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Flame');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			ToggleOption(node_3, {
				value: 'icicle',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Icicle');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => !$.get(focused) || $.get(focused).depth === 0);

		Button(node_4, {
			variant: 'fill-light',
			color: 'primary',
			get disabled() {
				return $.get($0);
			},
			size: 'sm',
			$$events: { click: () => $.set(focused, undefined) },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Reset zoom');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	Breadcrumb(node_5, {
		get items() {
			return $.get(breadcrumbItems);
		},
		class: 'mb-2 flex-nowrap overflow-x-auto',
		$$slots: {
			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);

				Button($$anchor, {
					slot: 'item',
					base: true,
					class: 'px-2 py-1 rounded-sm shrink-0 whitespace-nowrap',
					$$events: { click: () => $.set(focused, $.get(item), true) },
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							var div_1 = root_2();
							var div_2 = $.child(div_1);
							var text_3 = $.only_child(div_2, true);
							var div_3 = $.sibling(div_2, 2);
							var text_4 = $.only_child(div_3);

							$.reset(div_1);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_3, $.get(item).data.name);
									$.set_text(text_4, `${$0 ?? ''} · ${$1 ?? ''}`);
								},
								[
									() => format($.get(item).value ?? 0, 'integer'),
									() => format(($.get(item).value ?? 0) / totalValue, 'percent')
								]
							);

							$.append($$anchor, div_1);
						}
					}
				});
			}
		}
	});

	var node_6 = $.sibling(node_5, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_3 = root_1();
			var node_7 = $.first_child(fragment_3);

			Layer(node_7, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let xScale = () => ($$arg0?.()).xScale;

							ChartClipPath($$anchor, {
								children: ($$anchor, $$slotProps) => {
									{
										const children = ($$anchor, $$arg0) => {
											let nodes = () => ($$arg0?.()).nodes;
											var fragment_7 = $.comment();
											var node_8 = $.first_child(fragment_7);

											$.each(node_8, 17, nodes, (node) => nodeId(node), ($$anchor, node) => {
												const x0 = $.derived(() => Math.max(0, Math.min(context().width, xScale()($.get(node).x0))));
												const x1 = $.derived(() => Math.max(0, Math.min(context().width, xScale()($.get(node).x1))));
												const nodeWidth = $.derived(() => $.get(x1) - $.get(x0));
												var fragment_8 = $.comment();
												var node_9 = $.first_child(fragment_8);

												{
													var consequent_1 = ($$anchor) => {
														const id = $.derived(() => nodeId($.get(node)));
														const hovered = $.derived(() => $.get(hoveredId) === $.get(id));
														const row = $.derived(() => $.get(layout) === 'flame' ? root.height - $.get(node).depth : $.get(node).depth);

														{
															let $0 = $.derived(() => $.get(row) * rowHeight);

															Group($$anchor, {
																get x() {
																	return $.get(x0);
																},

																get y() {
																	return $.get($0);
																},
																onclick: () => $.set(focused, $.get(node), true),
																onpointermove: (e) => {
																	$.set(hoveredId, $.get(id), true);
																	context().tooltip.show(e, $.get(node));
																},

																onpointerleave: () => {
																	$.set(hoveredId, undefined);
																	context().tooltip.hide();
																},
																class: 'cursor-pointer',
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root_1();
																	var node_10 = $.first_child(fragment_10);

																	{
																		let $0 = $.derived(() => context().cGet($.get(node).data));
																		let $1 = $.derived(() => $.get(hovered) ? 'stroke-black/50' : 'stroke-surface-200');

																		Rect(node_10, {
																			get width() {
																				return $.get(nodeWidth);
																			},
																			height: barHeight,
																			rx: 2,
																			get fill() {
																				return $.get($0);
																			},

																			get class() {
																				return $.get($1);
																			}
																		});
																	}

																	var node_11 = $.sibling(node_10, 2);

																	{
																		var consequent = ($$anchor) => {
																			{
																				let $0 = $.derived(() => $.get(nodeWidth) - 4);

																				RectClipPath($$anchor, {
																					get width() {
																						return $.get($0);
																					},
																					height: barHeight,
																					children: ($$anchor, $$slotProps) => {
																						Text($$anchor, {
																							get value() {
																								return $.get(node).data.name;
																							},
																							x: 5,
																							y: barHeight / 2,
																							verticalAnchor: 'middle',
																							class: 'text-[11px] fill-black pointer-events-none'
																						});
																					},
																					$$slots: { default: true }
																				});
																			}
																		};

																		$.if(node_11, ($$render) => {
																			if ($.get(nodeWidth) > 26) $$render(consequent);
																		});
																	}

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														}
													};

													$.if(node_9, ($$render) => {
														if ($.get(nodeWidth) > 0.25) $$render(consequent_1);
													});
												}

												$.append($$anchor, fragment_8);
											});

											$.append($$anchor, fragment_7);
										};

										Partition($$anchor, {
											get hierarchy() {
												return root;
											},
											size: [1, 1],
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

						let $0 = $.derived(() => ({ x0: $.get(focused)?.x0 ?? 0, x1: $.get(focused)?.x1 ?? 1 }));
						let $1 = $.derived(() => ({ type: 'tween', duration: 500, easing: cubicOut }));

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

			var node_12 = $.sibling(node_7, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					const self = $.derived(() => data().data.value ?? 0);
					const total = $.derived(() => data().value ?? 0);
					var fragment_13 = root_1();
					var node_13 = $.first_child(fragment_13);

					$.component(node_13, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text();

								$.template_effect(() => $.set_text(text_5, data().data.name));
								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					});

					var node_14 = $.sibling(node_13, 2);

					$.component(node_14, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_15 = root_3();
								var node_15 = $.first_child(fragment_15);

								{
									let $0 = $.derived(() => format($.get(total), 'integer'));
									let $1 = $.derived(() => format($.get(total) / totalValue, 'percent'));

									$.component(node_15, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Total',
											get value() {
												return `${$.get($0) ?? ''} (${$.get($1) ?? ''})`;
											}
										});
									});
								}

								var node_16 = $.sibling(node_15, 2);

								{
									let $0 = $.derived(() => format($.get(self), 'integer'));
									let $1 = $.derived(() => format($.get(self) / totalValue, 'percent'));

									$.component(node_16, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Self',
											get value() {
												return `${$.get($0) ?? ''} (${$.get($1) ?? ''})`;
											}
										});
									});
								}

								var node_17 = $.sibling(node_16, 2);

								$.component(node_17, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Depth',
										get value() {
											return data().depth;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_15);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_13);
				};

				$.component(node_12, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_3);
		};

		let $0 = $.derived(() => scaleSequential(interpolateYlOrRd));

		Chart(node_6, {
			get height() {
				return chartHeight;
			},
			c: (d) => nameHash(d.name),
			get cScale() {
				return $.get($0);
			},
			cDomain: [-0.6, 1.6],
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}