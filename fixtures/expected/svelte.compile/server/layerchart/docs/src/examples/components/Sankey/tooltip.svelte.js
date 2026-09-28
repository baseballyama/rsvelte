import * as $ from 'svelte/internal/server';
import { Icon } from 'svelte-ux';
import LucideArrowRight from '~icons/lucide/arrow-right';
import { Chart, Group, Link, Rect, Layer, Text, Tooltip } from 'layerchart';
import { Sankey } from 'layerchart/graph';
import { getGreenhouseGraph } from '$lib/graph.remote';

const data = await getGreenhouseGraph();

export default function Tooltip_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
										strokeWidth: link.width,
										class: 'stroke-surface-content/10',
										onpointermove: (e) => context.tooltip.show(e, { link }),
										onpointerleave: () => context.tooltip.hide()
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
										children: ($$renderer) => {
											Rect($$renderer, {
												width: nodeWidth,
												height: nodeHeight,
												class: 'fill-primary',
												onpointermove: (e) => context.tooltip.show(e, { node }),
												onpointerleave: () => context.tooltip.hide()
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												value: node.name,
												x: node.height === 0 ? -4 : nodeWidth + 4,
												y: nodeHeight / 2,
												textAnchor: node.height === 0 ? 'end' : 'start',
												verticalAnchor: 'middle',
												class: 'pointer-events-none'
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Sankey($$renderer, {
								nodeId: (d) => d.name,
								nodeWidth: 8,
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
				flatData: [],
				height: 600,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}