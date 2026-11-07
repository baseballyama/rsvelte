import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@tabler/icons-svelte/icons/trending-up";
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { AreaChart } from "layerchart";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Data_table_cell_viewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ date: new Date("2024-01-01"), desktop: 186, mobile: 80 },
			{ date: new Date("2024-02-01"), desktop: 305, mobile: 200 },
			{ date: new Date("2024-03-01"), desktop: 237, mobile: 120 },
			{ date: new Date("2024-04-01"), desktop: 73, mobile: 190 },
			{ date: new Date("2024-05-01"), desktop: 209, mobile: 130 },
			{ date: new Date("2024-06-01"), desktop: 214, mobile: 140 }
		];

		const chartConfig = {
			desktop: { label: "Desktop", color: "var(--primary)" },
			mobile: { label: "Mobile", color: "var(--primary)" }
		};

		const isMobile = new IsMobile();
		let { item } = $$props;
		let type = $.derived(() => item.type);
		let status = $.derived(() => item.status);
		let reviewer = $.derived(() => item.reviewer);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					direction: isMobile.current ? "bottom" : "right",
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{
										variant: 'link',
										class: 'w-fit px-0 text-start text-foreground'
									},
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.header)}`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Drawer.Trigger) {
								$$renderer.push('<!--[-->');
								Drawer.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								children: ($$renderer) => {
									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											class: 'gap-1',
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(item.header)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Drawer.Description) {
													$$renderer.push('<!--[-->');

													Drawer.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Showing total visitors for the last 6 months`);
														},
														$$slots: { default: true }
													});

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

									$$renderer.push(` <div class="flex flex-col gap-4 overflow-y-auto px-4 text-sm">`);

									if (!isMobile.current) {
										$$renderer.push('<!--[0-->');

										if (Chart.Container) {
											$$renderer.push('<!--[-->');

											Chart.Container($$renderer, {
												config: chartConfig,
												children: ($$renderer) => {
													{
														function tooltip($$renderer) {
															if (Chart.Tooltip) {
																$$renderer.push('<!--[-->');

																Chart.Tooltip($$renderer, {
																	labelFormatter: (v) => {
																		return v.toLocaleDateString("en-US", { month: "long" });
																	},
																	indicator: 'dot'
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														AreaChart($$renderer, {
															data: chartData,
															x: 'date',
															xScale: scaleUtc(),
															yDomain: [0, 600],
															series: [
																{
																	key: "mobile",
																	label: "Mobile",
																	color: chartConfig.mobile.color
																},

																{
																	key: "desktop",
																	label: "Desktop",
																	color: chartConfig.desktop.color
																}
															],
															seriesLayout: 'stack',
															props: {
																area: {
																	curve: curveNatural,
																	fillOpacity: 0.4,
																	line: { class: "stroke-1" },
																	motion: "tween"
																},
																xAxis: {
																	format: (v) => v.toLocaleDateString("en-US", { month: "short" })
																},
																yAxis: { ticks: [0, 300, 600] }
															},
															tooltip,
															$$slots: { tooltip: true }
														});
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Separator($$renderer, {});
										$$renderer.push(`<!----> <div class="grid gap-2"><div class="flex gap-2 leading-none font-medium">Trending up by 5.2% this month `);
										TrendingUpIcon($$renderer, { class: 'size-4' });

										$$renderer.push(`<!----></div> <div class="text-muted-foreground">Showing total visitors for the last 6 months. This is just some random text to test the
						layout. It spans multiple lines and should wrap around.</div></div> `);

										Separator($$renderer, {});
										$$renderer.push(`<!---->`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <form class="flex flex-col gap-4"><div class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'header',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Header`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									Input($$renderer, { id: 'header', value: item.header });
									$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'type',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Type`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											get value() {
												return type();
											},

											set value($$value) {
												type($$value);
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														id: 'type',
														class: 'w-full',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(type() ?? "Select a type")}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Select.Content) {
													$$renderer.push('<!--[-->');

													Select.Content($$renderer, {
														children: ($$renderer) => {
															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Table of Contents',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Table of Contents`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Executive Summary',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Executive Summary`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Technical Approach',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Technical Approach`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Design',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Design`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Capabilities',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Capabilities`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Focus Documents',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Focus Documents`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Narrative',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Narrative`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Cover Page',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Cover Page`);
																	},
																	$$slots: { default: true }
																});

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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div> <div class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'status',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Status`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											get value() {
												return status();
											},

											set value($$value) {
												status($$value);
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														id: 'status',
														class: 'w-full',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(status() ?? "Select a status")}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Select.Content) {
													$$renderer.push('<!--[-->');

													Select.Content($$renderer, {
														children: ($$renderer) => {
															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Done',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Done`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'In Progress',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->In Progress`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Not Started',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Not Started`);
																	},
																	$$slots: { default: true }
																});

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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'target',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Target`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									Input($$renderer, { id: 'target', value: item.target });
									$$renderer.push(`<!----></div> <div class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'limit',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Limit`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									Input($$renderer, { id: 'limit', value: item.limit });
									$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'reviewer',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Reviewer`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											get value() {
												return reviewer();
											},

											set value($$value) {
												reviewer($$value);
												$$settled = false;
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														id: 'reviewer',
														class: 'w-full',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(reviewer() ?? "Select a reviewer")}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Select.Content) {
													$$renderer.push('<!--[-->');

													Select.Content($$renderer, {
														children: ($$renderer) => {
															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Eddie Lake',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Eddie Lake`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Jamik Tashpulatov',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Jamik Tashpulatov`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: 'Emily Whalen',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Emily Whalen`);
																	},
																	$$slots: { default: true }
																});

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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div></form></div> `);

									if (Drawer.Footer) {
										$$renderer.push('<!--[-->');

										Drawer.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Submit`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'outline' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Done`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Drawer.Close) {
														$$renderer.push('<!--[-->');
														Drawer.Close($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											},
											$$slots: { default: true }
										});

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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}