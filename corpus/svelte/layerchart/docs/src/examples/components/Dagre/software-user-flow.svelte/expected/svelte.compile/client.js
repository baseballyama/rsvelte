import 'svelte/internal/disclose-version';
import { getSoftwareUserFlowGraph } from '$lib/graph.remote';
import * as $ from 'svelte/internal/client';
import { curveLinear } from 'd3-shape';
import { cubicOut } from 'svelte/easing';
import { slide } from 'svelte/transition';
import { cls } from '@layerstack/tailwind';
import { Chart, Group, Layer, Rect, Spline, Text } from 'layerchart';
import { Dagre } from 'layerchart/graph';
import DagreControls from '$lib/components/controls/DagreControls.svelte';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

let data = await getSoftwareUserFlowGraph();
var root = $.from_svg(`<!><!>`, 1);
var root_1 = $.from_svg(`<g class="edges"></g><g class="nodes"></g>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<!> <div class="flex gap-2 pt-6"><!> <!></div>`, 1);

export default function Software_user_flow($$anchor, $$props) {
	$.push($$props, true);

	let settings = $.state($.proxy({
		ranker: 'network-simplex',
		direction: 'top-bottom',
		align: 'none',
		nodeSeparation: 50,
		rankSeparation: 50,
		edgeSeparation: 10,
		edgeLabelPosition: 'center',
		edgeLabelOffset: 10,
		curve: curveLinear,
		arrow: 'triangle'
	}));

	let showSettings = $.state(false);

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

	ShowControls(node_1, {
		label: 'Show Settings',
		get show() {
			return $.get(showSettings);
		},

		set show($$value) {
			$.set(showSettings, $$value, true);
		}
	});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	{
		let $0 = $.derived(() => ({
			mode: 'canvas',
			initialScale: 0.75,
			initialTranslate: { x: 0, y: -110 },
			scrollMode: 'scale',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}));

		Chart(node_2, {
			get transform() {
				return $.get($0);
			},
			clip: true,
			height: 700,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_3 = $.first_child(fragment_1);

				TransformContextControls(node_3, {});

				var node_4 = $.sibling(node_3, 2);

				Layer(node_4, {
					children: ($$anchor, $$slotProps) => {
						{
							const children = ($$anchor, $$arg0) => {
								let nodes = () => ($$arg0?.()).nodes;
								let edges = () => ($$arg0?.()).edges;
								var fragment_3 = root_1();
								var g = $.first_child(fragment_3);

								$.each(g, 23, edges, (edge) => edge.v + '-' + edge.w, ($$anchor, edge) => {
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => $.get(settings)?.curve);

										Spline(node_5, {
											get data() {
												return $.get(edge).points;
											},
											x: 'x',
											y: 'y',
											class: 'stroke-surface-content opacity-30',
											motion: 'tween',
											get curve() {
												return $.get($0);
											},

											get markerEnd() {
												return $.get(settings).arrow;
											}
										});
									}

									var node_6 = $.sibling(node_5);

									Text(node_6, {
										get value() {
											return $.get(edge).label;
										},

										get x() {
											return $.get(edge).x;
										},

										get y() {
											return $.get(edge).y;
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'stroke-2 stroke-surface-100',
										motion: 'tween'
									});

									$.append($$anchor, fragment_4);
								});

								$.reset(g);

								var g_1 = $.sibling(g);

								$.each(g_1, 21, nodes, (node) => node.label, ($$anchor, node) => {
									{
										let $0 = $.derived(() => $.get(node).x - $.get(node).width / 2);
										let $1 = $.derived(() => $.get(node).y - $.get(node).height / 2);

										Group($$anchor, {
											get x() {
												return $.get($0);
											},

											get y() {
												return $.get($1);
											},
											motion: 'tween',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												{
													let $0 = $.derived(() => cls('fill-surface-200 stroke-2 stroke-primary/50', $.get(node).label === 'CLOSED' && 'fill-danger/10 stroke-danger/50', $.get(node).label === 'ESTAB' && 'fill-success/10 stroke-success/50'));

													Rect(node_7, {
														get width() {
															return $.get(node).width;
														},

														get height() {
															return $.get(node).height;
														},

														get class() {
															return $.get($0);
														},
														rx: 10
													});
												}

												var node_8 = $.sibling(node_7);

												{
													let $0 = $.derived(() => $.get(node).width / 2);
													let $1 = $.derived(() => $.get(node).height / 2);
													let $2 = $.derived(() => cls('text-xs pointer-events-none'));

													Text(node_8, {
														get value() {
															return $.get(node).label;
														},

														get x() {
															return $.get($0);
														},

														get y() {
															return $.get($1);
														},
														dy: -2,
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														get class() {
															return $.get($2);
														}
													});
												}

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									}
								});

								$.reset(g_1);
								$.append($$anchor, fragment_3);
							};

							Dagre($$anchor, $.spread_props(
								{
									get data() {
										return data;
									},
									edges: (d) => d.links
								},
								() => $.get(settings),
								{ children, $$slots: { default: true } }
							));
						}
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var node_9 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_3();
			var node_10 = $.child(div_1);

			DagreControls(node_10, {
				get settings() {
					return $.get(settings);
				},

				set settings($$value) {
					$.set(settings, $$value, true);
				}
			});

			$.reset(div_1);
			$.transition(3, div_1, () => slide, () => ({ axis: 'x' }));
			$.append($$anchor, div_1);
		};

		$.if(node_9, ($$render) => {
			if ($.get(showSettings)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}