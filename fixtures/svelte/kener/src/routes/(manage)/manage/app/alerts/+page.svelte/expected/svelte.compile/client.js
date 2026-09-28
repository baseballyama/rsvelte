import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import PlusIcon from "@lucide/svelte/icons/plus";
import EditIcon from "@lucide/svelte/icons/pencil";
import ListIcon from "@lucide/svelte/icons/list";
import BellOffIcon from "@lucide/svelte/icons/bell-off";
import { goto } from "$app/navigation";
import { toast } from "svelte-sonner";
import GC from "$lib/global-constants";
import { getAlertText } from "$lib/alerts/alert-text";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Create Alert`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col items-center gap-4"><!> <div class="space-y-2"><h3 class="text-lg font-semibold">No alert configurations</h3> <p class="text-muted-foreground text-sm"> </p></div> <!></div>`);
var root_4 = $.from_html(`<span class="text-muted-foreground">,</span>`);
var root_5 = $.from_html(`<a class="text-primary text-sm font-medium hover:underline"> </a> <!>`, 1);
var root_6 = $.from_html(`<div class="flex flex-wrap gap-1"></div>`);
var root_7 = $.from_html(`<span class="text-muted-foreground text-sm">-</span>`);
var root_8 = $.from_html(`<div class="max-w-xs space-y-1"><p class="text-muted-foreground line-clamp-2 text-sm"> </p></div>`);
var root_9 = $.from_html(`<div class="space-y-2"><p class="text-sm"> </p></div>`);
var root_10 = $.from_html(`<div class="text-sm"> </div>`);
var root_11 = $.from_html(`<div class="space-y-1"></div>`);
var root_12 = $.from_html(`<!> Edit`, 1);
var root_13 = $.from_html(`<!> Logs`, 1);
var root_14 = $.from_html(`<div class="flex items-center justify-end gap-1"><!> <!></div>`);
var root_15 = $.from_html(`<span class="text-muted-foreground px-1">...</span>`);
var root_16 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"></div> <!></div>`);
var root_17 = $.from_html(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm"> </span> <!></div>`);
var root_18 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><!> <!></div> <!></div> <div class="ktable rounded-lg border"><!></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// State
	let loading = $.state(true);

	let configs = $.state($.proxy([]));
	let monitors = $.state($.proxy([]));
	let totalPages = $.state(0);
	let totalCount = $.state(0);
	let pageNo = $.state(1);
	let monitorFilter = $.state("");
	const limit = 20;

	// Fetch alert configs
	async function fetchConfigs() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getAlertConfigsPaginated",
					data: {
						page: $.get(pageNo),
						limit,
						monitor_tag: $.get(monitorFilter) || undefined
					}
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(configs, result.configs, true);
				$.set(totalCount, result.total, true);
				$.set(totalPages, Math.ceil(result.total / limit), true);
			}
		} catch(error) {
			console.error("Error fetching alert configs:", error);
		} finally {
			$.set(loading, false);
		}
	}

	// Fetch monitors for filter dropdown
	async function fetchMonitors() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getMonitors", data: {} })
			});

			const result = await response.json();

			if (!result.error && Array.isArray(result)) {
				$.set(monitors, result.map((m) => ({ tag: m.tag, name: m.name })), true);
			}
		} catch(error) {
			console.error("Error fetching monitors:", error);
		}
	}

	// Toggle alert status
	async function toggleAlertStatus(config) {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "toggleMonitorAlertConfigStatus",
					data: { id: config.id }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(result.is_active === "YES" ? "Alert activated" : "Alert deactivated");
				await fetchConfigs();
			}
		} catch(error) {
			toast.error("Failed to toggle alert status");
		}
	}

	// Get badge variant for severity
	function getSeverityBadgeVariant(severity) {
		switch (severity) {
			case "CRITICAL":
				return "destructive";

			case "WARNING":
				return "secondary";

			default:
				return "default";
		}
	}

	// Handle monitor filter change
	function handleMonitorChange(value) {
		$.set(monitorFilter, value || "", true);
		$.set(pageNo, 1);
		fetchConfigs();
	}

	// Pagination
	function goToPage(page) {
		$.set(pageNo, page, true);
		fetchConfigs();
	}

	$.user_effect(() => {
		fetchConfigs();
		fetchMonitors();
	});

	var div = root_18();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(monitorFilter);
			},
			onValueChange: handleMonitorChange,
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'w-48',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(($0) => $.set_text(text, $0), [
								() => $.get(monitorFilter)
									? $.get(monitors).find((m) => m.tag === $.get(monitorFilter))?.name || $.get(monitorFilter)
									: "All Monitors"
							]);

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Select.Item, ($$anchor, Select_Item) => {
								Select_Item($$anchor, {
									value: '',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('All Monitors');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.each(node_4, 17, () => $.get(monitors), $.index, ($$anchor, monitor) => {
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								$.component(node_5, () => Select.Item, ($$anchor, Select_Item_1) => {
									Select_Item_1($$anchor, {
										get value() {
											return $.get(monitor).tag;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(monitor).name));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Spinner($$anchor, { class: 'size-5' });
		};

		$.if(node_6, ($$render) => {
			if ($.get(loading)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var node_7 = $.sibling(div_2, 2);

	Button(node_7, {
		onclick: () => goto(clientResolver(resolve, "/manage/app/alerts/new")),
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_1();
			var node_8 = $.first_child(fragment_6);

			PlusIcon(node_8, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_9 = $.child(div_3);

	$.component(node_9, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root();
				var node_10 = $.first_child(fragment_7);

				$.component(node_10, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_11 = $.first_child(fragment_8);

							$.component(node_11, () => Table.Row, ($$anchor, Table_Row) => {
								Table_Row($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_2();
										var node_12 = $.first_child(fragment_9);

										$.component(node_12, () => Table.Head, ($$anchor, Table_Head) => {
											Table_Head($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Monitors');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Table.Head, ($$anchor, Table_Head_1) => {
											Table_Head_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Alert Type');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => Table.Head, ($$anchor, Table_Head_2) => {
											Table_Head_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Severity');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Table.Head, ($$anchor, Table_Head_3) => {
											Table_Head_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Description');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Table.Head, ($$anchor, Table_Head_4) => {
											Table_Head_4($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Triggers');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Table.Head, ($$anchor, Table_Head_5) => {
											Table_Head_5($$anchor, {
												class: 'w-20 text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Active');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => Table.Head, ($$anchor, Table_Head_6) => {
											Table_Head_6($$anchor, {
												class: 'w-32 text-right',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Actions');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_19 = $.sibling(node_10, 2);

				$.component(node_19, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = $.comment();
							var node_20 = $.first_child(fragment_10);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_21 = $.first_child(fragment_11);

									$.component(node_21, () => Table.Row, ($$anchor, Table_Row_1) => {
										Table_Row_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = $.comment();
												var node_22 = $.first_child(fragment_12);

												$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														colspan: 7,
														class: 'text-muted-foreground py-16 text-center',
														children: ($$anchor, $$slotProps) => {
															var div_4 = root_3();
															var node_23 = $.child(div_4);

															BellOffIcon(node_23, { class: 'text-muted-foreground size-16' });

															var div_5 = $.sibling(node_23, 2);
															var p = $.sibling($.child(div_5), 2);
															var text_10 = $.only_child(p, true);

															$.reset(div_5);

															var node_24 = $.sibling(div_5, 2);

															Button(node_24, {
																onclick: () => goto(clientResolver(resolve, "/manage/app/alerts/new")),
																children: ($$anchor, $$slotProps) => {
																	var fragment_13 = root_1();
																	var node_25 = $.first_child(fragment_13);

																	PlusIcon(node_25, { class: 'size-4' });
																	$.next();
																	$.append($$anchor, fragment_13);
																},
																$$slots: { default: true }
															});

															$.reset(div_4);

															$.template_effect(() => $.set_text(text_10, $.get(monitorFilter)
																? "No alerts found for this monitor."
																: "Create an alert to get notified when your monitors have issues."));

															$.append($$anchor, div_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								};

								var alternate_2 = ($$anchor) => {
									var fragment_14 = $.comment();
									var node_26 = $.first_child(fragment_14);

									$.each(node_26, 17, () => $.get(configs), (config) => config.id, ($$anchor, config) => {
										var fragment_15 = $.comment();
										var node_27 = $.first_child(fragment_15);

										{
											let $0 = $.derived(() => $.get(config).is_active === GC.NO ? "opacity-60" : "");

											$.component(node_27, () => Table.Row, ($$anchor, Table_Row_2) => {
												Table_Row_2($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_16 = root_2();
														var node_28 = $.first_child(fragment_16);

														$.component(node_28, () => Table.Cell, ($$anchor, Table_Cell_1) => {
															Table_Cell_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_17 = $.comment();
																	var node_29 = $.first_child(fragment_17);

																	{
																		var consequent_3 = ($$anchor) => {
																			var div_6 = root_6();

																			$.each(div_6, 21, () => $.get(config).monitor_tags, $.index, ($$anchor, tag) => {
																				var fragment_18 = root_5();
																				var a = $.first_child(fragment_18);
																				var text_11 = $.only_child(a, true);
																				var node_30 = $.sibling(a, 2);

																				{
																					var consequent_2 = ($$anchor) => {
																						var span = root_4();

																						$.append($$anchor, span);
																					};

																					var d = $.derived(() => $.get(config).monitor_tags.indexOf($.get(tag)) < $.get(config).monitor_tags.length - 1);

																					$.if(node_30, ($$render) => {
																						if ($.get(d)) $$render(consequent_2);
																					});
																				}

																				$.template_effect(
																					($0, $1) => {
																						$.set_attribute(a, 'href', $0);
																						$.set_text(text_11, $1);
																					},
																					[
																						() => clientResolver(resolve, `/manage/app/monitors/${$.get(tag)}`),
																						() => $.get(monitors).find((m) => m.tag === $.get(tag))?.name || $.get(tag)
																					]
																				);

																				$.append($$anchor, fragment_18);
																			});

																			$.reset(div_6);
																			$.append($$anchor, div_6);
																		};

																		var alternate = ($$anchor) => {
																			var span_1 = root_7();

																			$.append($$anchor, span_1);
																		};

																		$.if(node_29, ($$render) => {
																			if ($.get(config).monitor_tags && $.get(config).monitor_tags.length > 0) $$render(consequent_3); else $$render(alternate, -1);
																		});
																	}

																	$.append($$anchor, fragment_17);
																},
																$$slots: { default: true }
															});
														});

														var node_31 = $.sibling(node_28, 2);

														$.component(node_31, () => Table.Cell, ($$anchor, Table_Cell_2) => {
															Table_Cell_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	Badge($$anchor, {
																		variant: 'outline',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_12 = $.text();

																			$.template_effect(() => $.set_text(text_12, $.get(config).alert_for));
																			$.append($$anchor, text_12);
																		},
																		$$slots: { default: true }
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_32 = $.sibling(node_31, 2);

														$.component(node_32, () => Table.Cell, ($$anchor, Table_Cell_3) => {
															Table_Cell_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	{
																		let $0 = $.derived(() => getSeverityBadgeVariant($.get(config).severity));

																		Badge($$anchor, {
																			get variant() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_13 = $.text();

																				$.template_effect(() => $.set_text(text_13, $.get(config).severity));
																				$.append($$anchor, text_13);
																			},
																			$$slots: { default: true }
																		});
																	}
																},
																$$slots: { default: true }
															});
														});

														var node_33 = $.sibling(node_32, 2);

														$.component(node_33, () => Table.Cell, ($$anchor, Table_Cell_4) => {
															Table_Cell_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_23 = $.comment();
																	var node_34 = $.first_child(fragment_23);

																	$.component(node_34, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																		Tooltip_Root($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_24 = root();
																				var node_35 = $.first_child(fragment_24);

																				$.component(node_35, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																					Tooltip_Trigger($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var div_7 = root_8();
																							var p_1 = $.child(div_7);
																							var text_14 = $.only_child(p_1, true);

																							$.reset(div_7);

																							$.template_effect(($0) => $.set_text(text_14, $0), [
																								() => getAlertText({
																									kind: "description",
																									alert_for: $.get(config).alert_for,
																									alert_value: $.get(config).alert_value,
																									failure_threshold: $.get(config).failure_threshold,
																									success_threshold: $.get(config).success_threshold
																								})
																							]);

																							$.append($$anchor, div_7);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_36 = $.sibling(node_35, 2);

																				$.component(node_36, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																					Tooltip_Content($$anchor, {
																						class: 'max-w-md',
																						children: ($$anchor, $$slotProps) => {
																							var div_8 = root_9();
																							var p_2 = $.child(div_8);
																							var text_15 = $.only_child(p_2, true);

																							$.reset(div_8);

																							$.template_effect(($0) => $.set_text(text_15, $0), [
																								() => getAlertText({
																									kind: "description",
																									alert_for: $.get(config).alert_for,
																									alert_value: $.get(config).alert_value,
																									failure_threshold: $.get(config).failure_threshold,
																									success_threshold: $.get(config).success_threshold
																								})
																							]);

																							$.append($$anchor, div_8);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_24);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_23);
																},
																$$slots: { default: true }
															});
														});

														var node_37 = $.sibling(node_33, 2);

														$.component(node_37, () => Table.Cell, ($$anchor, Table_Cell_5) => {
															Table_Cell_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_25 = $.comment();
																	var node_38 = $.first_child(fragment_25);

																	{
																		var consequent_4 = ($$anchor) => {
																			var fragment_26 = $.comment();
																			var node_39 = $.first_child(fragment_26);

																			$.component(node_39, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																				Tooltip_Root_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_27 = root();
																						var node_40 = $.first_child(fragment_27);

																						$.component(node_40, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																							Tooltip_Trigger_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									Badge($$anchor, {
																										variant: 'secondary',
																										class: 'cursor-pointer text-xs',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_16 = $.text();

																											$.template_effect(() => $.set_text(text_16, `${$.get(config).triggers.length ?? ''} trigger${$.get(config).triggers.length > 1 ? "s" : ""}`));
																											$.append($$anchor, text_16);
																										},
																										$$slots: { default: true }
																									});
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_41 = $.sibling(node_40, 2);

																						$.component(node_41, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																							Tooltip_Content_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var div_9 = root_11();

																									$.each(div_9, 21, () => $.get(config).triggers, (trigger) => trigger.id, ($$anchor, trigger) => {
																										var div_10 = root_10();
																										var text_17 = $.only_child(div_10, true);

																										$.template_effect(() => $.set_text(text_17, $.get(trigger).name));
																										$.append($$anchor, div_10);
																									});

																									$.reset(div_9);
																									$.append($$anchor, div_9);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_27);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_26);
																		};

																		var alternate_1 = ($$anchor) => {
																			var span_2 = root_7();

																			$.append($$anchor, span_2);
																		};

																		$.if(node_38, ($$render) => {
																			if ($.get(config).triggers && $.get(config).triggers.length > 0) $$render(consequent_4); else $$render(alternate_1, -1);
																		});
																	}

																	$.append($$anchor, fragment_25);
																},
																$$slots: { default: true }
															});
														});

														var node_42 = $.sibling(node_37, 2);

														$.component(node_42, () => Table.Cell, ($$anchor, Table_Cell_6) => {
															Table_Cell_6($$anchor, {
																class: 'text-center',
																children: ($$anchor, $$slotProps) => {
																	{
																		let $0 = $.derived(() => $.get(config).is_active === GC.YES);

																		Switch($$anchor, {
																			get checked() {
																				return $.get($0);
																			},
																			onCheckedChange: () => toggleAlertStatus($.get(config))
																		});
																	}
																},
																$$slots: { default: true }
															});
														});

														var node_43 = $.sibling(node_42, 2);

														$.component(node_43, () => Table.Cell, ($$anchor, Table_Cell_7) => {
															Table_Cell_7($$anchor, {
																class: 'text-right',
																children: ($$anchor, $$slotProps) => {
																	var div_11 = root_14();
																	var node_44 = $.child(div_11);

																	Button(node_44, {
																		variant: 'outline',
																		size: 'sm',
																		onclick: () => goto(clientResolver(resolve, `/manage/app/alerts/${$.get(config).id}`)),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_31 = root_12();
																			var node_45 = $.first_child(fragment_31);

																			EditIcon(node_45, { class: 'size-3' });
																			$.next();
																			$.append($$anchor, fragment_31);
																		},
																		$$slots: { default: true }
																	});

																	var node_46 = $.sibling(node_44, 2);

																	Button(node_46, {
																		variant: 'outline',
																		size: 'sm',
																		onclick: () => goto(clientResolver(resolve, `/manage/app/alerts/logs/${$.get(config).id}`)),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_32 = root_13();
																			var node_47 = $.first_child(fragment_32);

																			ListIcon(node_47, { class: 'size-3' });
																			$.next();
																			$.append($$anchor, fragment_32);
																		},
																		$$slots: { default: true }
																	});

																	$.reset(div_11);
																	$.append($$anchor, div_11);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_16);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_15);
									});

									$.append($$anchor, fragment_14);
								};

								$.if(node_20, ($$render) => {
									if ($.get(configs).length === 0 && !$.get(loading)) $$render(consequent_1); else $$render(alternate_2, -1);
								});
							}

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_3);

	var node_48 = $.sibling(div_3, 2);

	{
		var consequent_8 = ($$anchor) => {
			const startItem = $.derived(() => ($.get(pageNo) - 1) * limit + 1);
			const endItem = $.derived(() => Math.min($.get(pageNo) * limit, $.get(totalCount)));
			var div_12 = root_17();
			var span_3 = $.child(div_12);
			var text_18 = $.only_child(span_3);
			var node_49 = $.sibling(span_3, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_13 = root_16();
					var node_50 = $.child(div_13);

					{
						let $0 = $.derived(() => $.get(pageNo) === 1);

						Button(node_50, {
							variant: 'outline',
							size: 'icon',
							get disabled() {
								return $.get($0);
							},
							onclick: () => goToPage($.get(pageNo) - 1),
							children: ($$anchor, $$slotProps) => {
								ChevronLeftIcon($$anchor, { class: 'size-4' });
							},
							$$slots: { default: true }
						});
					}

					var div_14 = $.sibling(node_50, 2);

					$.each(div_14, 21, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), $.index, ($$anchor, page) => {
						var fragment_34 = $.comment();
						var node_51 = $.first_child(fragment_34);

						{
							var consequent_5 = ($$anchor) => {
								{
									let $0 = $.derived(() => $.get(page) === $.get(pageNo) ? "default" : "ghost");

									Button($$anchor, {
										get variant() {
											return $.get($0);
										},
										size: 'sm',
										onclick: () => goToPage($.get(page)),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text();

											$.template_effect(() => $.set_text(text_19, $.get(page)));
											$.append($$anchor, text_19);
										},
										$$slots: { default: true }
									});
								}
							};

							var consequent_6 = ($$anchor) => {
								var span_4 = root_15();

								$.append($$anchor, span_4);
							};

							$.if(node_51, ($$render) => {
								if ($.get(page) === 1 || $.get(page) === $.get(totalPages) || $.get(page) >= $.get(pageNo) - 1 && $.get(page) <= $.get(pageNo) + 1) $$render(consequent_5); else if ($.get(page) === $.get(pageNo) - 2 || $.get(page) === $.get(pageNo) + 2) $$render(consequent_6, 1);
							});
						}

						$.append($$anchor, fragment_34);
					});

					$.reset(div_14);

					var node_52 = $.sibling(div_14, 2);

					{
						let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages));

						Button(node_52, {
							variant: 'outline',
							size: 'icon',
							get disabled() {
								return $.get($0);
							},
							onclick: () => goToPage($.get(pageNo) + 1),
							children: ($$anchor, $$slotProps) => {
								ChevronRightIcon($$anchor, { class: 'size-4' });
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				$.if(node_49, ($$render) => {
					if ($.get(totalPages) > 1) $$render(consequent_7);
				});
			}

			$.reset(div_12);
			$.template_effect(() => $.set_text(text_18, `Showing ${$.get(startItem) ?? ''}-${$.get(endItem) ?? ''} of ${$.get(totalCount) ?? ''}`));
			$.append($$anchor, div_12);
		};

		$.if(node_48, ($$render) => {
			if ($.get(totalCount) > 0) $$render(consequent_8);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}