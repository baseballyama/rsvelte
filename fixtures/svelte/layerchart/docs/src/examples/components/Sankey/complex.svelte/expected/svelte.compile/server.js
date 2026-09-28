import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { interpolateCool } from 'd3-scale-chromatic';
import { extent } from 'd3-array';
import { Icon } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import LucideArrowRight from '~icons/lucide/arrow-right';
import { Chart, Group, Link, Rect, Layer, Text, Tooltip } from 'layerchart';
import { Sankey } from 'layerchart/graph';
import SankeyControls from '$lib/components/controls/SankeyControls.svelte';
import { getComplexGraph } from '$lib/graph.remote';

const data = await getComplexGraph();

export default function Complex($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorScale = scaleSequential(interpolateCool);
		let highlightLinkIndexes = [];

		let config = {
			nodeAlign: 'justify',
			nodePadding: 4,
			nodeWidth: 10,
			nodeColorBy: 'layer',
			linkColorBy: 'static'
		};

		const linkOpacity = $.derived(() => config.linkColorBy === 'static'
			? { default: 0.1, inactive: 0.01 }
			: { default: 0.2, inactive: 0.01 });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SankeyControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { links, nodes }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(links);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let link = each_array[$$index];

										Link($$renderer, {
											sankey: true,
											data: link,
											stroke: config.linkColorBy === 'static'
												? undefined
												: colorScale(link[config.linkColorBy][config.nodeColorBy]),
											strokeOpacity: highlightLinkIndexes.length && !highlightLinkIndexes.includes(link.index) ? linkOpacity().inactive : linkOpacity().default,
											strokeWidth: link.width,
											class: cls('transition[stroke-opacity] duration-300', config.linkColorBy === 'static' && 'stroke-surface-content'),
											onpointerenter: () => highlightLinkIndexes = [link.index],
											onpointermove: (e) => context.tooltip.show(e, { link }),
											onpointerleave: () => {
												highlightLinkIndexes = [];
												context.tooltip.hide();
											},
											motion: 'tween'
										});
									}

									$$renderer.push(`<!--]--> <!--[-->`);

									const each_array_1 = $.ensure_array_like(nodes);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let node = each_array_1[$$index_1];
										const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0);
										const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0);

										Group($$renderer, {
											x: node.x0,
											y: node.y0,
											motion: 'tween',
											children: ($$renderer) => {
												Rect($$renderer, {
													width: nodeWidth,
													height: nodeHeight,
													fill: colorScale(node[config.nodeColorBy]),
													fillOpacity: 0.5,
													onpointerenter: () => {
														highlightLinkIndexes = [
															...node.sourceLinks?.map((l) => l.index) ?? [],
															...node.targetLinks?.map((l) => l.index) ?? []
														];
													},
													onpointermove: (e) => context.tooltip.show(e, { node }),
													onpointerleave: () => {
														highlightLinkIndexes = [];
														context.tooltip.hide();
													},
													motion: 'tween'
												});

												$$renderer.push(`<!----> `);

												Text($$renderer, {
													value: node.name,
													x: nodeWidth + 4,
													y: nodeHeight / 2,
													dy: -2,
													verticalAnchor: 'middle',
													class: 'pointer-events-none text-[10px]'
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								}

								Sankey($$renderer, {
									nodeAlign: config.nodeAlign,
									nodePadding: config.nodePadding,
									nodeWidth: config.nodeWidth,
									onUpdate: (e) => {
										// Calculate domain extents from Sankey data
										// TODO: Update as 'nodeColorBy' changes
										// @ts-expect-error
										const extents = extent(e.nodes, (d) => d[config.nodeColorBy]);

										// @ts-expect-error
										colorScale.domain(extents);
									},
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
										if (data.node) {
											$$renderer.push(`<!--[0-->${$.escape(data.node.name)}`);
										} else if (data.link) {
											$$renderer.push(`<!--[1-->${$.escape(data.link.source.name)} `);
											Icon($$renderer, { data: LucideArrowRight, class: 'text-white/50' });
											$$renderer.push(`<!----> ${$.escape(data.link.target.name)}`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
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
										if (data.node) {
											$$renderer.push('<!--[0-->');

											if (Tooltip.Item) {
												$$renderer.push('<!--[-->');
												Tooltip.Item($$renderer, { label: 'Total', value: data.node.value, format: 'decimal' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (data.node.targetLinks.length) {
												$$renderer.push('<!--[0-->');

												if (Tooltip.Separator) {
													$$renderer.push('<!--[-->');
													Tooltip.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <div class="col-span-full text-sm">Sources</div> <!--[-->`);

												const each_array_2 = $.ensure_array_like(data.node.targetLinks);

												for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
													let link = each_array_2[$$index_2];

													if (Tooltip.Item) {
														$$renderer.push('<!--[-->');

														Tooltip.Item($$renderer, {
															label: link.source.name,
															value: link.value,
															format: 'decimal'
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (data.node.sourceLinks.length) {
												$$renderer.push('<!--[0-->');

												if (Tooltip.Separator) {
													$$renderer.push('<!--[-->');
													Tooltip.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <div class="col-span-full text-sm">Targets</div> <!--[-->`);

												const each_array_3 = $.ensure_array_like(data.node.sourceLinks);

												for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
													let link = each_array_3[$$index_3];

													if (Tooltip.Item) {
														$$renderer.push('<!--[-->');

														Tooltip.Item($$renderer, {
															label: link.target.name,
															value: link.value,
															format: 'decimal'
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										} else if (data.link) {
											$$renderer.push('<!--[1-->');

											if (Tooltip.Item) {
												$$renderer.push('<!--[-->');
												Tooltip.Item($$renderer, { label: 'Value', value: data.link.value, format: 'decimal' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
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

				Chart($$renderer, {
					data,
					padding: { right: 164 },
					flatData: [],
					height: 800,
					children,
					$$slots: { default: true }
				});
			}

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