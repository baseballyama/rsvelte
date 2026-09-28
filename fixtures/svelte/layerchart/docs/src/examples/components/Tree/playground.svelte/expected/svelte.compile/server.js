import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { curveBumpX } from 'd3-shape';
import { Chart, Group, Link, Layer, Rect, Text } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import TreeControls from '$lib/components/controls/TreeControls.svelte';
import { cls } from '@layerstack/tailwind';
import { getFlare, getSimpleTree } from '$lib/data.remote';

let [flareData, simpleTreeData] = await Promise.all([getFlare(), getSimpleTree()]);

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const datasetOptions = [
			{ label: 'Simple', value: 'simple' },
			{ label: 'Complex (flare)', value: 'flare' }
		];

		let selectedDataset = 'simple';
		const rawData = $.derived(() => selectedDataset === 'flare' ? flareData : simpleTreeData);
		const defaultExpanded = $.derived(() => selectedDataset === 'flare' ? ['flare'] : ['R', 'A', 'B']);

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

		let expandedNodeNames = ['R', 'A', 'B'];

		// Reset expanded nodes when dataset changes
		const hierarchy = $.derived(() => d3Hierarchy(rawData(), (d) => expandedNodeNames.includes(d.name) ? d.children : null));

		let selected = void 0;

		function getNodeKey(node) {
			return node.data.name + node.depth;
		}

		const nodeWidth = $.derived(() => selectedDataset === 'simple' ? 60 : 120);
		const nodeHeight = 20;

		const nodeSize = $.derived(() => config.orientation === 'radial'
			? [
				config.angularSpacing * Math.PI / 180,
				nodeWidth() + config.parentGap
			]
			: config.orientation === 'horizontal'
				? [
					nodeHeight + config.siblingGap,
					nodeWidth() + config.parentGap
				]
				: [
					nodeWidth() + config.siblingGap,
					nodeHeight + config.parentGap
				]);

		const data = $.derived(rawData);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TreeControls($$renderer, {
				datasetOptions,
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				},

				get dataset() {
					return selectedDataset;
				},

				set dataset($$value) {
					selectedDataset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				padding: config.orientation === 'radial'
					? 80
					: { top: 32, left: nodeWidth() / 2, right: nodeWidth() / 2 },
				radial: config.orientation === 'radial',
				transform: {
					mode: 'canvas',
					motion: { type: 'tween', duration: 800, easing: cubicOut }
				},
				clip: true,
				height: 800,
				children: ($$renderer) => {
					TransformContextControls($$renderer, { orientation: 'horizontal' });
					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { nodes, links }) {
							Layer($$renderer, {
								children: ($$renderer) => {
									Group($$renderer, {
										center: config.orientation === 'radial',
										children: ($$renderer) => {
											Group($$renderer, {
												opacity: 0.2,
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(links);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let link = each_array[$$index];

														Link($$renderer, {
															data: link,
															orientation: config.orientation === 'radial' ? undefined : config.orientation,
															curve: config.curve,
															type: config.type,
															sweep: config.sweep,
															radius: config.radius,
															bend: config.bend,
															motion: 'tween',
															class: 'stroke-surface-content'
														});
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <!--[-->`);

											const each_array_1 = $.ensure_array_like(nodes);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let node = each_array_1[$$index_1];

												const nodeX = config.orientation === 'radial'
													? node.y * Math.sin(node.x)
													: config.orientation === 'horizontal' ? node.y : node.x;

												const nodeY = config.orientation === 'radial'
													? -node.y * Math.cos(node.x)
													: config.orientation === 'horizontal' ? node.x : node.y;

												Group($$renderer, {
													x: nodeX - nodeWidth() / 2,
													y: nodeY - nodeHeight / 2,
													motion: 'tween',
													onclick: () => {
														if (expandedNodeNames.includes(node.data.name)) {
															expandedNodeNames = expandedNodeNames.filter((name) => name !== node.data.name);
														} else {
															expandedNodeNames = [...expandedNodeNames, node.data.name];
														}

														selected = node;

														// transform.zoomTo({
														//   x: orientation === 'horizontal' ? selected.y : selected.x,
														//   y: orientation === 'horizontal' ? selected.x : selected.y,
														// });
													},
													class: cls(node.data.children && 'cursor-pointer'),
													children: ($$renderer) => {
														const isRoot = node.depth === 0;
														const isExpanded = expandedNodeNames.includes(node.data.name);

														Rect($$renderer, {
															width: nodeWidth(),
															height: nodeHeight,
															class: cls(isRoot && isExpanded
																? 'fill-success stroke-success'
																: isRoot
																	? 'fill-surface-100 stroke-success'
																	: isExpanded
																		? 'fill-primary stroke-primary'
																		: node.data.children
																			? 'stroke-primary hover:stroke-2 fill-surface-100'
																			: 'stroke-secondary [stroke-dasharray:1] fill-surface-100'),
															rx: node.data.children ? 4 : nodeHeight / 2
														});

														$$renderer.push(`<!----> `);

														Text($$renderer, {
															value: node.data.name,
															x: nodeWidth() / 2,
															y: nodeHeight / 2,
															dy: -2,
															textAnchor: 'middle',
															verticalAnchor: 'middle',
															class: cls('text-xs pointer-events-none', isRoot && isExpanded
																? 'fill-success-content font-bold'
																: isRoot
																	? 'fill-success font-bold'
																	: isExpanded
																		? 'fill-primary-content font-bold'
																		: node.data.children ? 'fill-primary' : 'fill-secondary')
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
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