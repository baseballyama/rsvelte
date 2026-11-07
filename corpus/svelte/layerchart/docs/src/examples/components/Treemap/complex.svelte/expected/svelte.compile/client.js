import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import { interpolateGnBu, schemeSpectral } from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import TreemapControls from '$lib/components/controls/TreemapControls.svelte';
import { format, sortFunc } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';

import {
	Chart,
	Group,
	Layer,
	Rect,
	RectClipPath,
	Text,
	Tooltip,
	findAncestor
} from 'layerchart';

import { Treemap } from 'layerchart/hierarchy';

const data = await getFlare();
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Complex($$anchor, $$props) {
	$.push($$props, true);

	const root = hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc'));

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

	const sequentialColor = scaleSequential([4, -1], interpolateGnBu);
	const ordinalColor = scaleOrdinal(schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
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

	var fragment = root_1();
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
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Layer(node_3, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, nodes, $.index, ($$anchor, node) => {
								Group($$anchor, {
									get x() {
										return $.get(node).x0;
									},

									get y() {
										return $.get(node).y0;
									},
									onpointermove: (e) => context().tooltip.show(e, $.get(node)),
									get onpointerleave() {
										return context().tooltip.hide;
									},

									children: ($$anchor, $$slotProps) => {
										const nodeWidth = $.derived(() => $.get(node).x1 - $.get(node).x0);
										const nodeHeight = $.derived(() => $.get(node).y1 - $.get(node).y0);
										const nodeColor = $.derived(() => getNodeColor($.get(node), $.get(config).colorBy));
										var fragment_5 = root_1();
										var node_5 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => $.get(config).colorBy === 'children'
												? 'var(--color-primary-content)'
												: hsl($.get(nodeColor)).darker(1).toString());

											let $1 = $.derived(() => $.get(config).colorBy === 'children' ? 0.2 : 1);
											let $2 = $.derived(() => $.get(node).children ? 0.5 : 1);

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

												get fillOpacity() {
													return $.get($2);
												},
												rx: 5
											});
										}

										var node_6 = $.sibling(node_5, 2);

										RectClipPath(node_6, {
											get width() {
												return $.get(nodeWidth);
											},

											get height() {
												return $.get(nodeHeight);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_7 = $.first_child(fragment_6);

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

													Text(node_7, {
														get segments() {
															return $.get($0);
														},
														verticalAnchor: 'start',
														lineHeight: '10px',
														x: 4,
														y: 3.6
													});
												}

												var node_8 = $.sibling(node_7, 2);

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

													$.if(node_8, ($$render) => {
														if (!$.get(node).children) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						let $0 = $.derived(() => root.copy());

						Treemap($$anchor, {
							get hierarchy() {
								return $.get($0);
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

			var node_9 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_8 = root_1();
					var node_10 = $.first_child(fragment_8);

					$.component(node_10, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().data.name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_11 = $.sibling(node_10, 2);

					$.component(node_11, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = $.comment();
								var node_12 = $.first_child(fragment_10);

								$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				};

				$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart(node_2, { height: 800, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);
	$.pop();
}