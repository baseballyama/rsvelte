import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { hsl } from 'd3-color';

import {
	Arc,
	ArcLabel,
	Bounds,
	Chart,
	ClipPath,
	Layer,
	Tooltip,
	findAncestor
} from 'layerchart';

import { Partition } from 'layerchart/hierarchy';
import { Breadcrumb, Button } from 'svelte-ux';
import { format, sortFunc, compoundSortFunc } from '@layerstack/utils';
import SunburstControls from '$lib/components/controls/SunburstControls.svelte';

let data = await getFlare();
var root = $.from_html(`<div class="text-left"><div class="text-sm"> </div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Sunburst($$anchor, $$props) {
	$.push($$props, true);

	let colorBy = $.state('parent');
	const complexHierarchy = hierarchy(data).sum((d) => d.value).sort(compoundSortFunc(sortFunc('height', 'desc'), sortFunc('value', 'desc')));
	let selected = $.state($.proxy(complexHierarchy)); // select root initially
	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);

	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90));

	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)
	function getNodeColor(node, colorBy) {
		switch (colorBy) {
			case 'children':
				return node.children ? '#ccc' : '#ddd';

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

	var fragment = root_2();
	var node_1 = $.first_child(fragment);

	SunburstControls(node_1, {
		get colorBy() {
			return $.get(colorBy);
		},

		set colorBy($$value) {
			$.set(colorBy, $$value, true);
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
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			Layer(node_4, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let xScale = () => ($$arg0?.()).xScale;
							let yScale = () => ($$arg0?.()).yScale;

							{
								const children = ($$anchor, $$arg0) => {
									let nodes = () => ($$arg0?.()).nodes;
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									$.each(node_5, 17, nodes, $.index, ($$anchor, node) => {
										const isRoot = $.derived(() => $.get(node).depth === 0);
										const nodeColor = $.derived(() => getNodeColor($.get(node), $.get(colorBy)));
										const startAngle = $.derived(() => Math.max(0, Math.min(2 * Math.PI, xScale()($.get(node).x0))));
										const endAngle = $.derived(() => Math.max(0, Math.min(2 * Math.PI, xScale()($.get(node).x1))));
										const innerRadius = $.derived(() => Math.max(0, yScale()($.get(node).y0)));
										const outerRadius = $.derived(() => Math.max(0, yScale()($.get(node).y1)));
										const angle = $.derived(() => $.get(endAngle) - $.get(startAngle));
										const thickness = $.derived(() => $.get(outerRadius) - $.get(innerRadius));

										{
											const children = ($$anchor, arcProps = $.noop) => {
												var fragment_7 = $.comment();
												var node_6 = $.first_child(fragment_7);

												{
													var consequent = ($$anchor) => {
														{
															const clip = ($$anchor) => {
																Arc($$anchor, {
																	get startAngle() {
																		return $.get(startAngle);
																	},

																	get endAngle() {
																		return $.get(endAngle);
																	},

																	get innerRadius() {
																		return $.get(innerRadius);
																	},

																	get outerRadius() {
																		return $.get(outerRadius);
																	}
																});
															};

															ClipPath($$anchor, {
																clip,
																children: ($$anchor, $$slotProps) => {
																	ArcLabel($$anchor, $.spread_props(arcProps, {
																		placement: 'centroid-radial',
																		get value() {
																			return $.get(node).data.name;
																		},
																		class: 'text-[8px] fill-black pointer-events-none'
																	}));
																},
																$$slots: { clip: true, default: true }
															});
														}
													};

													$.if(node_6, ($$render) => {
														if (!$.get(isRoot) && $.get(angle) > 0.05 && $.get(thickness) > 10) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_7);
											};

											let $0 = $.derived(() => $.get(isRoot) ? 'transparent' : $.get(nodeColor));

											let $1 = $.derived(() => $.get(isRoot)
												? 'stroke-none cursor-pointer'
												: 'stroke-surface-300 cursor-pointer');

											Arc($$anchor, {
												get value() {
													return $.get(node).value;
												},

												get startAngle() {
													return $.get(startAngle);
												},

												get endAngle() {
													return $.get(endAngle);
												},

												get innerRadius() {
													return $.get(innerRadius);
												},

												get outerRadius() {
													return $.get(outerRadius);
												},

												get fill() {
													return $.get($0);
												},

												get class() {
													return $.get($1);
												},

												onclick: () => {
													$.set(selected, $.get(node), true);
												},
												onpointermove: (e) => context().tooltip.show(e, $.get(node)),
												get onpointerleave() {
													return context().tooltip.hide;
												},
												children,
												$$slots: { default: true }
											});
										}
									});

									$.append($$anchor, fragment_5);
								};

								Partition($$anchor, {
									get hierarchy() {
										return complexHierarchy;
									},
									size: [1, 1],
									children,
									$$slots: { default: true }
								});
							}
						};

						let $0 = $.derived(() => ({
							x0: $.get(selected)?.x0 ?? 0,
							x1: $.get(selected)?.x1 ?? 1,
							y0: $.get(selected)?.y0 ?? 0,
							y1: 1
						}));

						let $1 = $.derived(() => ({ type: 'tween', duration: 800, easing: cubicOut }));

						Bounds($$anchor, {
							get domain() {
								return $.get($0);
							},

							range: ({ height }) => ({
								x0: 0,
								x1: 2 * Math.PI,
								y0: $.get(selected)?.y0 ? 20 : 0,
								y1: height / 2
							}),

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

			var node_7 = $.sibling(node_4, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_11 = root_1();
					var node_8 = $.first_child(fragment_11);

					$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = $.comment();
								var node_10 = $.first_child(fragment_13);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_11);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_2);
		};

		Chart(node_3, { height: 800, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);
	$.pop();
}