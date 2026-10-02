import 'svelte/internal/disclose-version';
import { getFlare, getSimpleTree } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { curveBumpX } from 'd3-shape';
import { Chart, Group, Link, Layer, Rect, Text } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import TreeControls from '$lib/components/controls/TreeControls.svelte';
import { cls } from '@layerstack/tailwind';

let [flareData, simpleTreeData] = await Promise.all([getFlare(), getSimpleTree()]);
var root = $.from_html(`<!> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	const datasetOptions = [
		{ label: 'Simple', value: 'simple' },
		{ label: 'Complex (flare)', value: 'flare' }
	];

	let selectedDataset = $.state('simple');
	const rawData = $.derived(() => $.get(selectedDataset) === 'flare' ? flareData : simpleTreeData);
	const defaultExpanded = $.derived(() => $.get(selectedDataset) === 'flare' ? ['flare'] : ['R', 'A', 'B']);

	let config = $.state($.proxy({
		orientation: 'horizontal',
		layout: 'chart',
		type: 'd3',
		sweep: 'none',
		curve: curveBumpX,
		radius: 60,
		bend: 22.5,
		siblingGap: 20,
		parentGap: 100,
		angularSpacing: 23
	}));

	let expandedNodeNames = $.state($.proxy(['R', 'A', 'B']));

	$.user_effect(() => {
		// Reset expanded nodes when dataset changes
		$.get(selectedDataset);

		$.set(expandedNodeNames, [...$.get(defaultExpanded)], true);
	});

	const hierarchy = $.derived(() => d3Hierarchy($.get(rawData), (d) => $.get(expandedNodeNames).includes(d.name) ? d.children : null));
	let selected = $.state(void 0);

	function getNodeKey(node) {
		return node.data.name + node.depth;
	}

	const nodeWidth = $.derived(() => $.get(selectedDataset) === 'simple' ? 60 : 120);
	const nodeHeight = 20;

	const nodeSize = $.derived(() => $.get(config).orientation === 'radial'
		? [
			$.get(config).angularSpacing * Math.PI / 180,
			$.get(nodeWidth) + $.get(config).parentGap
		]
		: $.get(config).orientation === 'horizontal'
			? [
				nodeHeight + $.get(config).siblingGap,
				$.get(nodeWidth) + $.get(config).parentGap
			]
			: [
				$.get(nodeWidth) + $.get(config).siblingGap,
				nodeHeight + $.get(config).parentGap
			]);

	const data = $.derived(() => $.get(rawData));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root();
	var node_1 = $.first_child(fragment);

	TreeControls(node_1, {
		get datasetOptions() {
			return datasetOptions;
		},

		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		},

		get dataset() {
			return $.get(selectedDataset);
		},

		set dataset($$value) {
			$.set(selectedDataset, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $.get(config).orientation === 'radial'
			? 80
			: {
				top: 32,
				left: $.get(nodeWidth) / 2,
				right: $.get(nodeWidth) / 2
			});

		let $1 = $.derived(() => $.get(config).orientation === 'radial');

		let $2 = $.derived(() => ({
			mode: 'canvas',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}));

		Chart(node_2, {
			get padding() {
				return $.get($0);
			},

			get radial() {
				return $.get($1);
			},

			get transform() {
				return $.get($2);
			},
			clip: true,
			height: 800,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_3 = $.first_child(fragment_1);

				TransformContextControls(node_3, { orientation: 'horizontal' });

				var node_4 = $.sibling(node_3, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let nodes = () => ($$arg0?.()).nodes;
						let links = () => ($$arg0?.()).links;

						Layer($$anchor, {
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => $.get(config).orientation === 'radial');

									Group($$anchor, {
										get center() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_5 = $.first_child(fragment_4);

											Group(node_5, {
												opacity: 0.2,
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.each(node_6, 17, links, (link) => getNodeKey(link.source) + '_' + getNodeKey(link.target), ($$anchor, link) => {
														{
															let $0 = $.derived(() => $.get(config).orientation === 'radial' ? undefined : $.get(config).orientation);

															Link($$anchor, {
																get data() {
																	return $.get(link);
																},

																get orientation() {
																	return $.get($0);
																},

																get curve() {
																	return $.get(config).curve;
																},

																get type() {
																	return $.get(config).type;
																},

																get sweep() {
																	return $.get(config).sweep;
																},

																get radius() {
																	return $.get(config).radius;
																},

																get bend() {
																	return $.get(config).bend;
																},
																motion: 'tween',
																class: 'stroke-surface-content'
															});
														}
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});

											var node_7 = $.sibling(node_5, 2);

											$.each(node_7, 17, nodes, (node) => getNodeKey(node), ($$anchor, node) => {
												const nodeX = $.derived(() => $.get(config).orientation === 'radial'
													? $.get(node).y * Math.sin($.get(node).x)
													: $.get(config).orientation === 'horizontal' ? $.get(node).y : $.get(node).x);

												const nodeY = $.derived(() => $.get(config).orientation === 'radial'
													? -$.get(node).y * Math.cos($.get(node).x)
													: $.get(config).orientation === 'horizontal' ? $.get(node).x : $.get(node).y);

												{
													let $0 = $.derived(() => $.get(nodeX) - $.get(nodeWidth) / 2);
													let $1 = $.derived(() => $.get(nodeY) - nodeHeight / 2);
													let $2 = $.derived(() => cls($.get(node).data.children && 'cursor-pointer'));

													Group($$anchor, {
														get x() {
															return $.get($0);
														},

														get y() {
															return $.get($1);
														},
														motion: 'tween',
														onclick: () => {
															if ($.get(expandedNodeNames).includes($.get(node).data.name)) {
																$.set(expandedNodeNames, $.get(expandedNodeNames).filter((name) => name !== $.get(node).data.name), true);
															} else {
																$.set(expandedNodeNames, [...$.get(expandedNodeNames), $.get(node).data.name], true);
															}

															$.set(selected, $.get(node), true);

															// transform.zoomTo({
															//   x: orientation === 'horizontal' ? selected.y : selected.x,
															//   y: orientation === 'horizontal' ? selected.x : selected.y,
															// });
														},

														get class() {
															return $.get($2);
														},

														children: ($$anchor, $$slotProps) => {
															const isRoot = $.derived(() => $.get(node).depth === 0);
															const isExpanded = $.derived(() => $.get(expandedNodeNames).includes($.get(node).data.name));
															var fragment_8 = root();
															var node_8 = $.first_child(fragment_8);

															{
																let $0 = $.derived(() => cls($.get(isRoot) && $.get(isExpanded)
																	? 'fill-success stroke-success'
																	: $.get(isRoot)
																		? 'fill-surface-100 stroke-success'
																		: $.get(isExpanded)
																			? 'fill-primary stroke-primary'
																			: $.get(node).data.children
																				? 'stroke-primary hover:stroke-2 fill-surface-100'
																				: 'stroke-secondary [stroke-dasharray:1] fill-surface-100'));

																let $1 = $.derived(() => $.get(node).data.children ? 4 : nodeHeight / 2);

																Rect(node_8, {
																	get width() {
																		return $.get(nodeWidth);
																	},
																	height: nodeHeight,
																	get class() {
																		return $.get($0);
																	},

																	get rx() {
																		return $.get($1);
																	}
																});
															}

															var node_9 = $.sibling(node_8, 2);

															{
																let $0 = $.derived(() => $.get(nodeWidth) / 2);

																let $1 = $.derived(() => cls('text-xs pointer-events-none', $.get(isRoot) && $.get(isExpanded)
																	? 'fill-success-content font-bold'
																	: $.get(isRoot)
																		? 'fill-success font-bold'
																		: $.get(isExpanded)
																			? 'fill-primary-content font-bold'
																			: $.get(node).data.children ? 'fill-primary' : 'fill-secondary'));

																Text(node_9, {
																	get value() {
																		return $.get(node).data.name;
																	},

																	get x() {
																		return $.get($0);
																	},
																	y: nodeHeight / 2,
																	dy: -2,
																	textAnchor: 'middle',
																	verticalAnchor: 'middle',
																	get class() {
																		return $.get($1);
																	}
																});
															}

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												}
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					};

					let $0 = $.derived(() => $.get(config).orientation === 'radial' ? 'horizontal' : $.get(config).orientation);
					let $1 = $.derived(() => $.get(config).layout === 'node' ? $.get(nodeSize) : undefined);

					Tree(node_4, {
						get hierarchy() {
							return $.get(hierarchy);
						},

						get orientation() {
							return $.get($0);
						},

						get nodeSize() {
							return $.get($1);
						},
						children,
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}