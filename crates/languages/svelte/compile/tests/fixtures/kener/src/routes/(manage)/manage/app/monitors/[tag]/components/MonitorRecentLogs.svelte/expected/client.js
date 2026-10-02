import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`View All <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between"><div><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);
var root_2 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_3 = $.from_html(`<div class="text-muted-foreground py-8 text-center text-sm">No monitoring data found for this monitor</div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<span class="text-muted-foreground text-sm"> </span>`);
var root_6 = $.from_html(`<span class="text-sm"> </span>`);
var root_7 = $.from_html(`<span class="text-muted-foreground text-sm">—</span>`);
var root_8 = $.from_html(`<span class="text-destructive line-clamp-1 max-w-xs text-sm"> </span>`);
var root_9 = $.from_html(`<p class="break-words"> </p>`);
var root_10 = $.from_html(`<!> <!>`, 1);
var root_11 = $.from_html(`<div class="ktable rounded-lg border"><!></div>`);

export default function MonitorRecentLogs($$anchor, $$props) {
	$.push($$props, true);

	// Types
	// State
	let loading = $.state(true);

	let logs = $.state($.proxy([]));

	// Fetch last 10 logs for this monitor
	async function fetchLogs() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getMonitoringDataPaginated",
					data: { page: 1, limit: 10, monitor_tag: $$props.monitor_tag }
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(logs, result.data, true);
			}
		} catch(error) {
			console.error("Error fetching monitoring logs:", error);
		} finally {
			$.set(loading, false);
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

	// Refetch when monitor_tag changes
	$.user_effect(() => {
		if ($$props.monitor_tag) {
			fetchLogs();
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_10();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var div_1 = $.child(div);
							var node_2 = $.child(div_1);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Recent Logs');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Last 10 monitoring data points');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_4 = $.child(div_2);

							Button(node_4, {
								variant: 'ghost',
								size: 'icon',
								onclick: fetchLogs,
								get disabled() {
									return $.get(loading);
								},

								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => $.get(loading) ? 'animate-spin' : '');

										RefreshCwIcon($$anchor, {
											get class() {
												return `size-4 ${$.get($0) ?? ''}`;
											}
										});
									}
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							{
								let $0 = $.derived(() => clientResolver(resolve, "/manage/app/monitoring-data"));

								Button(node_5, {
									variant: 'outline',
									size: 'sm',
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_3 = root();
										var node_6 = $.sibling($.first_child(fragment_3));

										ExternalLinkIcon(node_6, { class: 'ml-1 size-3' });
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_2);
							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_1, 2);

				$.component(node_7, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_8 = $.first_child(fragment_4);

							{
								var consequent = ($$anchor) => {
									var div_3 = root_2();
									var node_9 = $.child(div_3);

									Spinner(node_9, { class: 'size-6' });
									$.reset(div_3);
									$.append($$anchor, div_3);
								};

								var consequent_1 = ($$anchor) => {
									var div_4 = root_3();

									$.append($$anchor, div_4);
								};

								var alternate_3 = ($$anchor) => {
									var div_5 = root_11();
									var node_10 = $.child(div_5);

									$.component(node_10, () => Table.Root, ($$anchor, Table_Root) => {
										Table_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_10();
												var node_11 = $.first_child(fragment_5);

												$.component(node_11, () => Table.Header, ($$anchor, Table_Header) => {
													Table_Header($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = $.comment();
															var node_12 = $.first_child(fragment_6);

															$.component(node_12, () => Table.Row, ($$anchor, Table_Row) => {
																Table_Row($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_4();
																		var node_13 = $.first_child(fragment_7);

																		$.component(node_13, () => Table.Head, ($$anchor, Table_Head) => {
																			Table_Head($$anchor, {
																				class: 'w-44',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('Timestamp');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_14 = $.sibling(node_13, 2);

																		$.component(node_14, () => Table.Head, ($$anchor, Table_Head_1) => {
																			Table_Head_1($$anchor, {
																				class: 'w-20',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('Status');

																					$.append($$anchor, text_3);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_15 = $.sibling(node_14, 2);

																		$.component(node_15, () => Table.Head, ($$anchor, Table_Head_2) => {
																			Table_Head_2($$anchor, {
																				class: 'w-20',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('Latency');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_16 = $.sibling(node_15, 2);

																		$.component(node_16, () => Table.Head, ($$anchor, Table_Head_3) => {
																			Table_Head_3($$anchor, {
																				class: 'w-20',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('Type');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_17 = $.sibling(node_16, 2);

																		$.component(node_17, () => Table.Head, ($$anchor, Table_Head_4) => {
																			Table_Head_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('Error');

																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_11, 2);

												$.component(node_18, () => Table.Body, ($$anchor, Table_Body) => {
													Table_Body($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = $.comment();
															var node_19 = $.first_child(fragment_8);

															$.each(node_19, 17, () => $.get(logs), (log) => log.timestamp, ($$anchor, log) => {
																var fragment_9 = $.comment();
																var node_20 = $.first_child(fragment_9);

																$.component(node_20, () => Table.Row, ($$anchor, Table_Row_1) => {
																	Table_Row_1($$anchor, {
																		class: 'hover:bg-muted/50',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_4();
																			var node_21 = $.first_child(fragment_10);

																			$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell) => {
																				Table_Cell($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var span = root_5();
																						var text_7 = $.only_child(span, true);

																						$.template_effect(($0) => $.set_text(text_7, $0), [() => formatTimestamp($.get(log).timestamp)]);
																						$.append($$anchor, span);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_22 = $.sibling(node_21, 2);

																			$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																				Table_Cell_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						{
																							let $0 = $.derived(() => getStatusBadgeVariant($.get(log).status));

																							Badge($$anchor, {
																								get variant() {
																									return $.get($0);
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_8 = $.text();

																									$.template_effect(() => $.set_text(text_8, $.get(log).status || "N/A"));
																									$.append($$anchor, text_8);
																								},
																								$$slots: { default: true }
																							});
																						}
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_23 = $.sibling(node_22, 2);

																			$.component(node_23, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																				Table_Cell_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_13 = $.comment();
																						var node_24 = $.first_child(fragment_13);

																						{
																							var consequent_2 = ($$anchor) => {
																								var span_1 = root_6();
																								var text_9 = $.only_child(span_1);

																								$.template_effect(() => $.set_text(text_9, `${$.get(log).latency ?? ''} ms`));
																								$.append($$anchor, span_1);
																							};

																							var alternate = ($$anchor) => {
																								var span_2 = root_7();

																								$.append($$anchor, span_2);
																							};

																							$.if(node_24, ($$render) => {
																								if ($.get(log).latency !== null) $$render(consequent_2); else $$render(alternate, -1);
																							});
																						}

																						$.append($$anchor, fragment_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_25 = $.sibling(node_23, 2);

																			$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																				Table_Cell_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_14 = $.comment();
																						var node_26 = $.first_child(fragment_14);

																						{
																							var consequent_3 = ($$anchor) => {
																								Badge($$anchor, {
																									variant: 'secondary',
																									class: 'text-xs',
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_10 = $.text();

																										$.template_effect(() => $.set_text(text_10, $.get(log).type));
																										$.append($$anchor, text_10);
																									},
																									$$slots: { default: true }
																								});
																							};

																							var alternate_1 = ($$anchor) => {
																								var span_3 = root_7();

																								$.append($$anchor, span_3);
																							};

																							$.if(node_26, ($$render) => {
																								if ($.get(log).type) $$render(consequent_3); else $$render(alternate_1, -1);
																							});
																						}

																						$.append($$anchor, fragment_14);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_27 = $.sibling(node_25, 2);

																			$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																				Table_Cell_4($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_17 = $.comment();
																						var node_28 = $.first_child(fragment_17);

																						{
																							var consequent_4 = ($$anchor) => {
																								var fragment_18 = $.comment();
																								var node_29 = $.first_child(fragment_18);

																								$.component(node_29, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																									Tooltip_Root($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_19 = root_10();
																											var node_30 = $.first_child(fragment_19);

																											$.component(node_30, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																												Tooltip_Trigger($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var span_4 = root_8();
																														var text_11 = $.only_child(span_4, true);

																														$.template_effect(() => $.set_text(text_11, $.get(log).error_message));
																														$.append($$anchor, span_4);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_31 = $.sibling(node_30, 2);

																											$.component(node_31, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																												Tooltip_Content($$anchor, {
																													class: 'max-w-md',
																													children: ($$anchor, $$slotProps) => {
																														var p = root_9();
																														var text_12 = $.only_child(p, true);

																														$.template_effect(() => $.set_text(text_12, $.get(log).error_message));
																														$.append($$anchor, p);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_19);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_18);
																							};

																							var alternate_2 = ($$anchor) => {
																								var span_5 = root_7();

																								$.append($$anchor, span_5);
																							};

																							$.if(node_28, ($$render) => {
																								if ($.get(log).error_message) $$render(consequent_4); else $$render(alternate_2, -1);
																							});
																						}

																						$.append($$anchor, fragment_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_5);
									$.append($$anchor, div_5);
								};

								$.if(node_8, ($$render) => {
									if ($.get(loading) && $.get(logs).length === 0) $$render(consequent); else if ($.get(logs).length === 0) $$render(consequent_1, 1); else $$render(alternate_3, -1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}