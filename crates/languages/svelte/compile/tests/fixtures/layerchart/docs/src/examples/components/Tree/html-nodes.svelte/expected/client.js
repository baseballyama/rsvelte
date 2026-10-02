import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { curveBumpX } from 'd3-shape';
import { Chart, Group, Link, Layer } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import { cls } from '@layerstack/tailwind';
import TreeControls from '$lib/components/controls/TreeControls.svelte';

let data = await getFlare();
var root = $.from_html(`<!> <!>`, 1);

export default function Html_nodes($$anchor, $$props) {
	$.push($$props, true);

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

	let expandedNodeNames = $.state($.proxy(['flare']));
	const hierarchy = $.derived(() => d3Hierarchy(data, (d) => $.get(expandedNodeNames).includes(d.name) ? d.children : null));

	// .sum((d) => d.value)
	// .sort(sortFunc('value', 'desc'));
	let selected = $.state(void 0);

	function getNodeKey(node) {
		return node.data.name + node.depth;
	}

	const nodeWidth = 120;
	const nodeHeight = 20;
	const nodeSiblingGap = 20;
	const nodeParentGap = 100;

	const nodeSize = $.derived(() => $.get(config).orientation === 'horizontal'
		? [nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap]
		: [nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap]);

	var $$exports = {
		get data() {
			return data;
		},

		set data($$value) {
			data = $$value;
		}
	};

	var fragment = root();
	var node_1 = $.first_child(fragment);

	TreeControls(node_1, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => ({
			mode: 'canvas',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}));

		Chart(node_2, {
			get transform() {
				return $.get($0);
			},
			padding: { top: 24, left: nodeWidth / 2, right: nodeWidth / 2 },
			height: 800,
			clip: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_3 = $.first_child(fragment_1);

				TransformContextControls(node_3, { orientation: 'horizontal', class: '-m-2' });

				var node_4 = $.sibling(node_3, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let nodes = () => ($$arg0?.()).nodes;
						let links = () => ($$arg0?.()).links;
						var fragment_2 = root();
						var node_5 = $.first_child(fragment_2);

						Layer(node_5, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_6 = $.first_child(fragment_3);

								$.each(node_6, 17, links, (link) => getNodeKey(link.source) + '_' + getNodeKey(link.target), ($$anchor, link) => {
									{
										let $0 = $.derived(() => $.get(config).orientation === 'radial' ? 'horizontal' : $.get(config).orientation);

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
											motion: 'tween',
											class: 'stroke-surface-content opacity-20'
										});
									}
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_5, 2);

						Layer(node_7, {
							type: 'html',
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_8 = $.first_child(fragment_5);

								$.each(node_8, 17, nodes, $.index, ($$anchor, node) => {
									const x = $.derived(() => ($.get(config).orientation === 'horizontal' ? $.get(node).y : $.get(node).x) - nodeWidth / 2);
									const y = $.derived(() => ($.get(config).orientation === 'horizontal' ? $.get(node).x : $.get(node).y) - nodeHeight / 2);

									{
										let $0 = $.derived(() => cls('bg-surface-100 rounded-full outline', 'text-xs text-center', $.get(node).data.children
											? 'outline-primary hover:outline-2 text-primary cursor-pointer'
											: 'outline-secondary text-secondary outline-dashed'));

										Group($$anchor, {
											get x() {
												return $.get(x);
											},

											get y() {
												return $.get(y);
											},
											motion: 'tween',
											style: 'width: 120px; height: 20px;',
											get class() {
												return $.get($0);
											},

											onclick: () => {
												if ($.get(expandedNodeNames).includes($.get(node).data.name)) {
													$.set(expandedNodeNames, $.get(expandedNodeNames).filter((name) => name !== $.get(node).data.name), true);
												} else {
													$.set(expandedNodeNames, [...$.get(expandedNodeNames), $.get(node).data.name], true);
												}

												$.set(selected, $.get(node), true);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $.get(node).data.name));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
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