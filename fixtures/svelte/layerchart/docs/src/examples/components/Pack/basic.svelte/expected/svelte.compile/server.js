import * as $ from 'svelte/internal/server';
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
import { getFlare } from '$lib/data.remote';

let data = await getFlare();

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let colorBy = 'parent';
		let padding = 3;
		let nodes = [];
		let selected = void 0;
		let context = null;

		// Move until https://github.com/sveltejs/svelte/issues/17090 is resolved
		const complexHierarchy = hierarchy(data).sum((d) => d.value).sort(sortFunc('value', 'desc'));

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PackControls($$renderer, {
				get padding() {
					return padding;
				},

				set padding($$value) {
					padding = $$value;
					$$settled = false;
				},

				get colorBy() {
					return colorBy;
				},

				set colorBy($$value) {
					colorBy = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Breadcrumb($$renderer, {
				items: selected
					? selected?.ancestors().reverse()
					: nodes[0]?.ancestors().reverse() ?? [],
				class: 'mb-2',
				$$slots: {
					item: ($$renderer, { item }) => {
						Button($$renderer, {
							slot: 'item',
							base: true,
							class: 'px-2 py-1 rounded-sm',
							children: ($$renderer) => {
								$$renderer.push(`<div class="text-left"><div class="text-sm">${$.escape(item.data.name)}</div> <div class="text-xs text-surface-content/50">${$.escape(format(item.value ?? 0, 'integer'))}</div></div>`);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				transform: {
					mode: 'canvas',
					disablePointer: true,
					motion: { type: 'tween', duration: 800, easing: cubicOut }
				},
				height: 600,
				clip: true,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Layer($$renderer, {
						onclick: () => selected = complexHierarchy,
						children: ($$renderer) => {
							Pack($$renderer, {
								padding,
								hierarchy: complexHierarchy,
								get nodes() {
									return nodes;
								},

								set nodes($$value) {
									nodes = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									const selectedNodes = selected
										? selected.children ?? [selected]
										: nodes[0] ? nodes[0].children ?? [nodes[0]] : [];

									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(nodes);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let node = each_array[$$index];

										Group($$renderer, {
											x: node.x,
											y: node.y,
											onclick: (e) => {
												e.stopPropagation();
												selected = node;
											},
											class: 'cursor-pointer hover:contrast-[1.2]',
											children: ($$renderer) => {
												const nodeColor = getNodeColor(node, colorBy);

												Circle($$renderer, {
													r: node.r,
													stroke: hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1).toString(),
													strokeWidth: 1 / context.transform.scale,
													fill: nodeColor
												});
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--><!--[-->`);

									const each_array_1 = $.ensure_array_like(selectedNodes);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let node = each_array_1[$$index_1];
										const trueNode = findSelectedNodeInHierarchy(node, nodes);
										const fontSize = 1 / context.transform.scale;

										$$renderer.push(`<g>`);

										Text($$renderer, {
											value: trueNode.data.name,
											x: trueNode.x,
											y: trueNode.y,
											dy: fontSize * 8,
											style: `font-size: ${$.stringify(fontSize)}rem; stroke-width: ${$.stringify(fontSize * 2)}px`,
											class: 'fill-black stroke-white/70 pointer-events-none [text-anchor:middle] [paint-order:stroke]'
										});

										$$renderer.push(`<!----></g>`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
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
	});
}