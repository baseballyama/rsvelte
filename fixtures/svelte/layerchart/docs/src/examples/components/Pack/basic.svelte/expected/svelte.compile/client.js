import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { fade } from 'svelte/transition';
import { hierarchy } from 'd3-hierarchy';
import { scaleSequential, scaleOrdinal } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import { Chart, Circle, Group, Layer, Text, findAncestor } from 'layerchart';
import { Pack } from 'layerchart/hierarchy';
import { Breadcrumb, Button } from 'svelte-ux';
import { format, sortFunc } from '@layerstack/utils';
import PackControls from '$lib/components/controls/PackControls.svelte';

let data = await getFlare();
var root = $.from_html(`<div class="text-left"><div class="text-sm"> </div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_1 = $.from_svg(`<g><!></g>`);
var root_2 = $.from_svg(`<!><!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	let colorBy = $.state('parent');
	let padding = $.state(3);
	let nodes = $.state([]);
	let selected = $.state(void 0);
	let context = $.state(null);

	// Move until https://github.com/sveltejs/svelte/issues/17090 is resolved
	const complexHierarchy = hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc'));

	$.user_effect(() => {
		if ($.get(context)?.transform && $.get(selected)) {
			const node = findSelectedNodeInHierarchy($.get(selected), $.get(nodes));
			const diameter = node.r * 2;

			$.get(context).transform.zoomTo({ x: node.x, y: node.y }, { width: diameter, height: diameter });
		}
	});

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

	function findSelectedNodeInHierarchy(selectedNode, hierarchy) {
		for (const node of hierarchy) {
			if (node.data.name === selectedNode.data.name) {
				return node;
			}
		}

		return selectedNode;
	}

	var fragment = root_3();
	var node_1 = $.first_child(fragment);

	PackControls(node_1, {
		get padding() {
			return $.get(padding);
		},

		set padding($$value) {
			$.set(padding, $$value, true);
		},

		get colorBy() {
			return $.get(colorBy);
		},

		set colorBy($$value) {
			$.set(colorBy, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $.get(selected)
			? $.get(selected)?.ancestors().reverse()
			: $.get(nodes)[0]?.ancestors().reverse() ?? []);

		Breadcrumb(node_2, {
			get items() {
				return $.get($0);
			},
			class: 'mb-2',
			$$slots: {
				item: ($$anchor, $$slotProps) => {
					const item = $.derived(() => $$slotProps.item);

					Button($$anchor, {
						slot: 'item',
						base: true,
						class: 'px-2 py-1 rounded-sm',
						$$events: { click: () => $.set(selected, $.get(item)) },
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
		let $0 = $.derived(() => ({
			mode: 'canvas',
			disablePointer: true,
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}));

		Chart(node_3, {
			get transform() {
				return $.get($0);
			},
			height: 600,
			clip: true,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					onclick: () => $.set(selected, complexHierarchy),
					children: ($$anchor, $$slotProps) => {
						Pack($$anchor, {
							get padding() {
								return $.get(padding);
							},

							get hierarchy() {
								return complexHierarchy;
							},

							get nodes() {
								return $.get(nodes);
							},

							set nodes($$value) {
								$.set(nodes, $$value);
							},

							children: ($$anchor, $$slotProps) => {
								const selectedNodes = $.derived(() => $.get(selected)
									? $.get(selected).children ?? [$.get(selected)]
									: $.get(nodes)[0] ? $.get(nodes)[0].children ?? [$.get(nodes)[0]] : []);

								var fragment_4 = root_2();
								var node_4 = $.first_child(fragment_4);

								$.each(node_4, 17, () => $.get(nodes), (node) => [node.data.name, node.parent?.data.name].join('-'), ($$anchor, node) => {
									Group($$anchor, {
										get x() {
											return $.get(node).x;
										},

										get y() {
											return $.get(node).y;
										},

										onclick: (e) => {
											e.stopPropagation();
											$.set(selected, $.get(node));
										},
										class: 'cursor-pointer hover:contrast-[1.2]',
										children: ($$anchor, $$slotProps) => {
											const nodeColor = $.derived(() => getNodeColor($.get(node), $.get(colorBy)));

											{
												let $0 = $.derived(() => hsl($.get(nodeColor)).darker($.get(colorBy) === 'children' ? 0.5 : 1).toString());
												let $1 = $.derived(() => 1 / $.get(context).transform.scale);

												Circle($$anchor, {
													get r() {
														return $.get(node).r;
													},

													get stroke() {
														return $.get($0);
													},

													get strokeWidth() {
														return $.get($1);
													},

													get fill() {
														return $.get(nodeColor);
													}
												});
											}
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_4);

								$.each(node_5, 17, () => $.get(selectedNodes), (node) => [node.data.name, node.parent?.data.name].join('-'), ($$anchor, node) => {
									const trueNode = $.derived(() => findSelectedNodeInHierarchy($.get(node), $.get(nodes)));
									const fontSize = $.derived(() => 1 / $.get(context).transform.scale);
									var g = root_1();
									var node_6 = $.child(g);

									{
										let $0 = $.derived(() => $.get(fontSize) * 8);
										let $1 = $.derived(() => $.get(fontSize));
										let $2 = $.derived(() => $.get(fontSize) * 2);

										Text(node_6, {
											get value() {
												return $.get(trueNode).data.name;
											},

											get x() {
												return $.get(trueNode).x;
											},

											get y() {
												return $.get(trueNode).y;
											},

											get dy() {
												return $.get($0);
											},

											get style() {
												return `font-size: ${$.get($1) ?? ''}rem; stroke-width: ${$.get($2) ?? ''}px`;
											},
											class: 'fill-black stroke-white/70 pointer-events-none [text-anchor:middle] [paint-order:stroke]'
										});
									}

									$.reset(g);
									$.transition(1, g, () => fade);
									$.append($$anchor, g);
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}