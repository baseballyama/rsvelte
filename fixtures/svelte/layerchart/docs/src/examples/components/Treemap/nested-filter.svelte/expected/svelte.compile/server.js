import * as $ from 'svelte/internal/server';
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
import { getCars } from '$lib/data.remote';

let data = await getCars();

export default function Nested_filter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
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
		};

		let selectedCarNode = void 0;

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
			filter((d) => config.isFiltered ? d.year > 2010 : true).// Apply `make` selection
			filter((d) => {
				if (selectedCarNode?.depth === 1) {
					return d.make === selectedCarNode.data[0];
				} else {
					return true;
				}
			}),
			(items) => items[0], //.slice(0, 3),
			(d) => d.make,
			(d) => d.model
		));

		// d => d.year,
		let groupedHierarchy = void 0;

		const node = selectedCarNode ?? groupedHierarchy ?? null;
		const items = node ? node.ancestors().reverse() : [];
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TreemapControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Breadcrumb($$renderer, {
				items,
				class: 'my-2',
				$$slots: {
					item: ($$renderer, { item }) => {
						Button($$renderer, {
							slot: 'item',
							base: true,
							class: 'px-2 py-1 rounded-sm',
							children: ($$renderer) => {
								$$renderer.push(`<div class="text-left"><div class="text-sm">${$.escape(item.data[0] ?? 'Overall')}</div> <div class="text-xs text-surface-content/50">${$.escape(format(item.value ?? 0, 'integer'))}</div></div>`);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				height: 800,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { nodes }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(nodes);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let node = each_array[$$index];

										$$renderer.push(`<g>`);

										Group($$renderer, {
											x: node.x0,
											y: node.y0,
											onclick: () => {
												console.log('click');
												node.children ? selectedCarNode = node : null;
											},
											motion: { type: 'tween', delay: 600 },
											children: ($$renderer) => {
												const nodeWidth = node.x1 - node.x0;
												const nodeHeight = node.y1 - node.y0;
												const nodeColor = getNodeColor(node, config.colorBy);

												Rect($$renderer, {
													width: nodeWidth,
													height: nodeHeight,
													stroke: config.colorBy === 'children'
														? 'var(--color-primary-content)'
														: hsl(nodeColor).darker(1).toString(),
													strokeOpacity: config.colorBy === 'children' ? 0.2 : 1,
													fill: nodeColor,
													fillOpacity: node.children ? 0.5 : 1,
													rx: 5,
													motion: { type: 'tween', delay: 600 }
												});

												$$renderer.push(`<!---->`);

												RectClipPath($$renderer, {
													width: nodeWidth,
													height: nodeHeight,
													motion: { type: 'tween', delay: 600 },
													children: ($$renderer) => {
														Text($$renderer, {
															segments: [
																{
																	value: node.data[0] ?? 'Overall',
																	class: cls('text-[10px] font-medium', config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																},

																...node.children
																	? [
																		{
																			value: ` ${format(node.value ?? 0, 'integer')}`,
																			class: cls('text-[8px] font-extralight', config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black')
																		}
																	]
																	: []
															],
															verticalAnchor: 'start',
															lineHeight: '10px',
															x: 4,
															y: 3.6
														});

														$$renderer.push(`<!---->`);

														if (!node.children) {
															$$renderer.push('<!--[0-->');

															Text($$renderer, {
																value: format(node.value ?? 0, 'integer'),
																class: cls('text-[8px] font-extralight', config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black'),
																verticalAnchor: 'start',
																lineHeight: '8px',
																x: 4,
																y: 16
															});
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></g>`);
									}

									$$renderer.push(`<!--]-->`);
								}

								Treemap($$renderer, {
									hierarchy: groupedHierarchy,
									tile: config.tile,
									paddingOuter: config.paddingOuter,
									paddingInner: config.paddingInner,
									paddingTop: config.paddingTop,
									paddingBottom: config.paddingBottom,
									paddingLeft: config.paddingLeft,
									paddingRight: config.paddingRight,
									maintainAspectRatio: config.maintainAspectRatio,
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