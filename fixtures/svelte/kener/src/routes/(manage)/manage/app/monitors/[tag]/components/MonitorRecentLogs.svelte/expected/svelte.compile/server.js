import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/components/ui/badge/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import { format } from "date-fns";
import { onMount } from "svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function MonitorRecentLogs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitor_tag } = $$props;

		// Types
		// State
		let loading = true;

		let logs = [];

		// Fetch last 10 logs for this monitor
		async function fetchLogs() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getMonitoringDataPaginated",
						data: { page: 1, limit: 10, monitor_tag }
					})
				});

				const result = await response.json();

				if (!result.error) {
					logs = result.data;
				}
			} catch(error) {
				console.error("Error fetching monitoring logs:", error);
			} finally {
				loading = false;
			}
		}

		// Get badge variant for status
		function getStatusBadgeVariant(status) {
			switch (status) {
				case "DOWN":
					return "destructive";

				case "DEGRADED":
					return "outline";

				case "UP":
					return "default";

				default:
					return "secondary";
			}
		}

		// Format timestamp to date string
		function formatTimestamp(timestamp) {
			try {
				const date = new Date(timestamp * 1000);

				return format(date, "yyyy-MM-dd HH:mm:ss");
			} catch {
				return String(timestamp);
			}
		}

		onMount(() => {
			fetchLogs();
		});

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex items-center justify-between"><div>`);

								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Recent Logs`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Last 10 monitoring data points`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div> <div class="flex items-center gap-2">`);

								Button($$renderer, {
									variant: 'ghost',
									size: 'icon',
									onclick: fetchLogs,
									disabled: loading,
									children: ($$renderer) => {
										RefreshCwIcon($$renderer, { class: `size-4 ${loading ? 'animate-spin' : ''}` });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									href: clientResolver(resolve, "/manage/app/monitoring-data"),
									children: ($$renderer) => {
										$$renderer.push(`<!---->View All `);
										ExternalLinkIcon($$renderer, { class: 'ml-1 size-3' });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							children: ($$renderer) => {
								if (loading && logs.length === 0) {
									$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);
									Spinner($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></div>`);
								} else if (logs.length === 0) {
									$$renderer.push(`<!--[1--><div class="text-muted-foreground py-8 text-center text-sm">No monitoring data found for this monitor</div>`);
								} else {
									$$renderer.push(`<!--[-1--><div class="ktable rounded-lg border">`);

									if (Table.Root) {
										$$renderer.push('<!--[-->');

										Table.Root($$renderer, {
											children: ($$renderer) => {
												if (Table.Header) {
													$$renderer.push('<!--[-->');

													Table.Header($$renderer, {
														children: ($$renderer) => {
															if (Table.Row) {
																$$renderer.push('<!--[-->');

																Table.Row($$renderer, {
																	children: ($$renderer) => {
																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				class: 'w-44',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Timestamp`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				class: 'w-20',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Status`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				class: 'w-20',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Latency`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				class: 'w-20',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Type`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Error`);
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

												$$renderer.push(` `);

												if (Table.Body) {
													$$renderer.push('<!--[-->');

													Table.Body($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(logs);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let log = each_array[$$index];

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		class: 'hover:bg-muted/50',
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<span class="text-muted-foreground text-sm">${$.escape(formatTimestamp(log.timestamp))}</span>`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						Badge($$renderer, {
																							variant: getStatusBadgeVariant(log.status),
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(log.status || "N/A")}`);
																							},
																							$$slots: { default: true }
																						});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						if (log.latency !== null) {
																							$$renderer.push(`<!--[0--><span class="text-sm">${$.escape(log.latency)} ms</span>`);
																						} else {
																							$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">—</span>`);
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						if (log.type) {
																							$$renderer.push('<!--[0-->');

																							Badge($$renderer, {
																								variant: 'secondary',
																								class: 'text-xs',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(log.type)}`);
																								},
																								$$slots: { default: true }
																							});
																						} else {
																							$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">—</span>`);
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						if (log.error_message) {
																							$$renderer.push('<!--[0-->');

																							if (Tooltip.Root) {
																								$$renderer.push('<!--[-->');

																								Tooltip.Root($$renderer, {
																									children: ($$renderer) => {
																										if (Tooltip.Trigger) {
																											$$renderer.push('<!--[-->');

																											Tooltip.Trigger($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<span class="text-destructive line-clamp-1 max-w-xs text-sm">${$.escape(log.error_message)}</span>`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Tooltip.Content) {
																											$$renderer.push('<!--[-->');

																											Tooltip.Content($$renderer, {
																												class: 'max-w-md',
																												children: ($$renderer) => {
																													$$renderer.push(`<p class="break-words">${$.escape(log.error_message)}</p>`);
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
																						} else {
																							$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">—</span>`);
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
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}