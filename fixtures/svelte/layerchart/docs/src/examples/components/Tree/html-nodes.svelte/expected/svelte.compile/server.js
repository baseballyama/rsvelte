import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { curveBumpX } from 'd3-shape';
import { Chart, Group, Link, Layer } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import { cls } from '@layerstack/tailwind';
import TreeControls from '$lib/components/controls/TreeControls.svelte';
import { getFlare } from '$lib/data.remote';

let data = await getFlare();

export default function Html_nodes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
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
		};

		let expandedNodeNames = ['flare'];
		const hierarchy = $.derived(() => d3Hierarchy(data, (d) => expandedNodeNames.includes(d.name) ? d.children : null));

		// .sum((d) => d.value)
		// .sort(sortFunc('value', 'desc'));
		let selected = void 0;

		function getNodeKey(node) {
			return node.data.name + node.depth;
		}

		const nodeWidth = 120;
		const nodeHeight = 20;
		const nodeSiblingGap = 20;
		const nodeParentGap = 100;

		const nodeSize = $.derived(() => config.orientation === 'horizontal'
			? [nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap]
			: [nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TreeControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				transform: {
					mode: 'canvas',
					motion: { type: 'tween', duration: 800, easing: cubicOut }
				},
				padding: { top: 24, left: nodeWidth / 2, right: nodeWidth / 2 },
				height: 800,
				clip: true,
				children: ($$renderer) => {
					TransformContextControls($$renderer, { orientation: 'horizontal', class: '-m-2' });
					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { nodes, links }) {
							Layer($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(links);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let link = each_array[$$index];

										Link($$renderer, {
											data: link,
											orientation: config.orientation === 'radial' ? 'horizontal' : config.orientation,
											curve: config.curve,
											type: config.type,
											sweep: config.sweep,
											radius: config.radius,
											motion: 'tween',
											class: 'stroke-surface-content opacity-20'
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Layer($$renderer, {
								type: 'html',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(nodes);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let node = each_array_1[$$index_1];
										const x = (config.orientation === 'horizontal' ? node.y : node.x) - nodeWidth / 2;
										const y = (config.orientation === 'horizontal' ? node.x : node.y) - nodeHeight / 2;

										Group($$renderer, {
											x,
											y,
											motion: 'tween',
											style: 'width: 120px; height: 20px;',
											class: cls('bg-surface-100 rounded-full outline', 'text-xs text-center', node.data.children
												? 'outline-primary hover:outline-2 text-primary cursor-pointer'
												: 'outline-secondary text-secondary outline-dashed'),

											onclick: () => {
												if (expandedNodeNames.includes(node.data.name)) {
													expandedNodeNames = expandedNodeNames.filter((name) => name !== node.data.name);
												} else {
													expandedNodeNames = [...expandedNodeNames, node.data.name];
												}

												selected = node;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(node.data.name)}`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}

						Tree($$renderer, {
							hierarchy: hierarchy(),
							orientation: config.orientation === 'radial' ? 'horizontal' : config.orientation,
							nodeSize: config.layout === 'node' ? nodeSize() : undefined,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}