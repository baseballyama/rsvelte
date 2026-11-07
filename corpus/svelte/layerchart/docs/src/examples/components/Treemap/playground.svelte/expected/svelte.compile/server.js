import * as $ from 'svelte/internal/server';
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

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = {
			name: 'World',
			children: [
				{
					name: 'Europe',
					children: [
						{ name: 'Western Europe', value: 200 }, // ~200M based on UN data
						{ name: 'Southern Europe', value: 151 }, // ~151M based on UN data
						{ name: 'Eastern Europe', value: 284 }, // ~284M based on UN data
						{ name: 'Northern Europe', value: 109 } // ~109M based on UN data
					]
				},

				{
					name: 'Asia',
					children: [
						{ name: 'East Asia', value: 1652 }, // 1,652M based on UN data
						{ name: 'South Asia', value: 2085 }, // 2,085M based on UN data
						{ name: 'Southeast Asia', value: 700 }, // 700M based on UN data
						{ name: 'Western Asia', value: 314 }, // 314M based on UN data
						{ name: 'Central Asia', value: 84 } // 84M based on UN data
					]
				},

				{
					name: 'North America',
					children: [
						{ name: 'Northern America', value: 388 }, // ~388M based on UN data
						{ name: 'Central America', value: 184 } // ~184M (estimated from total minus Northern America)
					]
				},

				{
					name: 'South America',
					children: [{ name: 'South America', value: 434 }] // ~434M based on UN data
				},

				{
					name: 'Africa',
					children: [
						{ name: 'Western Africa', value: 467 }, // 467M based on UN data
						{ name: 'Southern Africa', value: 74 }, // 74M based on UN data
						{ name: 'Northern Africa', value: 276 }, // 276M based on UN data
						{ name: 'Eastern Africa', value: 513 }, // 513M based on UN data
						{ name: 'Middle Africa', value: 220 } // 220M based on UN data
					]
				},

				{
					name: 'Oceania',
					children: [{ name: 'Oceania', value: 47 }] // 47M based on UN data
				}
			]
		};

		const root = hierarchy(data).// @ts-expect-error
		sum((d) => d.value).sort(sortFunc('value', 'desc'));

		let config = {
			tile: 'squarify',
			colorBy: 'children',
			maintainAspectRatio: false,
			paddingOuter: 4,
			paddingInner: 4,
			paddingTop: 20,
			paddingBottom: 0,
			paddingLeft: 0,
			paddingRight: 0
		};

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

			$$renderer.push(`<!----> <div class="aspect-video">`);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { nodes }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(nodes);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let node = each_array[$$index];

										Group($$renderer, {
											x: node.x0,
											y: node.y0,
											onpointermove: (e) => context.tooltip.show(e, node),
											onpointerleave: context.tooltip.hide,
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
													rx: 5
												});

												$$renderer.push(`<!----> `);

												RectClipPath($$renderer, {
													width: nodeWidth,
													height: nodeHeight,
													children: ($$renderer) => {
														Text($$renderer, {
															segments: [
																{
																	value: node.data.name,
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

														$$renderer.push(`<!----> `);

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
									}

									$$renderer.push(`<!--]-->`);
								}

								Treemap($$renderer, {
									hierarchy: root,
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

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(data.data.name)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'value', value: data.value, format: 'integer' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, { children, $$slots: { default: true } });
			}

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}