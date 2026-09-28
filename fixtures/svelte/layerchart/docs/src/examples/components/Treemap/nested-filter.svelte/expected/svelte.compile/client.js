import 'svelte/internal/disclose-version';
import { getCars } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import { fade } from 'svelte/transition';
import { hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import { rollup } from 'd3-array';
import TreemapControls from '$lib/components/controls/TreemapControls.svelte';
import { Button, Breadcrumb } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { Chart, Group, Rect, RectClipPath, Layer, Text, findAncestor } from 'layerchart';
import { Treemap } from 'layerchart/hierarchy';

let data = await getCars();
var root = $.from_html(`<div class="text-left"><div class="text-sm"> </div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_1 = $.from_svg(`<!><!>`, 1);
var root_2 = $.from_svg(`<g><!></g>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Nested_filter($$anchor, $$props) {
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
		paddingRight: 0,
		isFiltered: false
	}));

	let selectedCarNode = $.state(void 0);

	const groupedCars = $.derived(() => rollup(
		data.// Limit dataset
		filter((d) => [
			'BMW',
			'Chevrolet',
			'Dodge',
			'Ford',
			'Honda',
			'Toyota',
			'Volkswagen'
		].includes(d.make)).// Hide some models in each group to show transitions
		filter((d) => $.get(config).isFiltered ? d.year > 2010 : true).// Apply `make` selection
		filter((d) => {
			if ($.get(selectedCarNode)?.depth === 1) {
				return d.make === $.get(selectedCarNode).data[0];
			} else {
				return true;
			}
		}),
		(items) => items[0], //.slice(0, 3),
		(d) => d.make,
		(d) => d.model
	));

	// d => d.year,
	let groupedHierarchy = $.state(void 0);

	$.user_pre_effect(() => {
		untrack(() => {
			$.set(selectedCarNode, $.get(groupedHierarchy), true);
		});
	});

	$.user_pre_effect(() => {
		$.set(groupedHierarchy, hierarchy($.get(groupedCars)).count(), true);
	});

	const node = $.proxy($.get(selectedCarNode) ?? $.get(groupedHierarchy) ?? null);
	const items = $.proxy(node ? node.ancestors().reverse() : []);
	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	const ordinalColor = scaleOrdinal(chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
	);

	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)
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

	var fragment = root_3();
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

	Breadcrumb(node_2, {
		get items() {
			return items;
		},
		class: 'my-2',
		$$slots: {
			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);

				Button($$anchor, {
					slot: 'item',
					base: true,
					class: 'px-2 py-1 rounded-sm',
					$$events: { click: () => $.set(selectedCarNode, $.get(item), true) },
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
									$.set_text(text, $.get(item).data[0] ?? 'Overall');
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

	Chart(node_3, {
		height: 800,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.each(node_4, 17, nodes, (node) => node.ancestors().map((n) => n.data[0]).join('_'), ($$anchor, node, $$index, $$array) => {
								var g = root_2();
								var node_5 = $.child(g);

								Group(node_5, {
									get x() {
										return $.get(node).x0;
									},

									get y() {
										return $.get(node).y0;
									},

									onclick: () => {
										console.log('click');
										$.get(node).children ? $.set(selectedCarNode, $.get(node), true) : null;
									},
									motion: { type: 'tween', delay: 600 },
									children: ($$anchor, $$slotProps) => {
										const nodeWidth = $.derived(() => $.get(node).x1 - $.get(node).x0);
										const nodeHeight = $.derived(() => $.get(node).y1 - $.get(node).y0);
										const nodeColor = $.derived(() => getNodeColor($.get(node), $.get(config).colorBy));
										var fragment_5 = root_1();
										var node_6 = $.first_child(fragment_5);

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
												rx: 5,
												motion: { type: 'tween', delay: 600 }
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
											motion: { type: 'tween', delay: 600 },
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_8 = $.first_child(fragment_6);

												{
													let $0 = $.derived(() => [
														{
															value: $.get(node).data[0] ?? 'Overall',
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

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});

								$.reset(g);
								$.transition(1, g, () => fade, () => ({ duration: 600, delay: 1200 }));
								$.transition(2, g, () => fade, () => ({ duration: 600 }));
								$.append($$anchor, g);
							});

							$.append($$anchor, fragment_4);
						};

						Treemap($$anchor, {
							get hierarchy() {
								return $.get(groupedHierarchy);
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
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}