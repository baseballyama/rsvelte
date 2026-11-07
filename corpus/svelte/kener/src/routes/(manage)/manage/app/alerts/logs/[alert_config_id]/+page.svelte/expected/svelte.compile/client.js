import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import BellOffIcon from "@lucide/svelte/icons/bell-off";
import TrashIcon from "@lucide/svelte/icons/trash";
import { format } from "date-fns";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center gap-4 py-16 text-center"><!> <div class="space-y-2"><h3 class="text-lg font-semibold">No alert logs</h3> <p class="text-muted-foreground text-sm"> </p></div></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<span class="text-muted-foreground text-sm">—</span>`);
var root_5 = $.from_html(`<a class="text-primary inline-flex items-center gap-1 text-sm hover:underline"> <!></a>`);
var root_6 = $.from_html(`<!> Delete`, 1);
var root_7 = $.from_html(`<div class="ktable rounded-lg border"><!></div>`);
var root_8 = $.from_html(`<span class="text-muted-foreground px-1">...</span>`);
var root_9 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"></div> <!></div>`);
var root_10 = $.from_html(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm"> </span> <!></div>`);
var root_11 = $.from_html(`<div class="flex items-center gap-3 py-2"><!> <label for="delete-incident" class="text-sm">Also delete associated incident <span class="text-primary font-medium"> </span></label></div>`);
var root_12 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><!>  <div class="flex items-center gap-3"><!> <!></div> <!> <!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const alertConfigId = $.derived(() => $$props.data.alert_config_id);

	// State
	let loading = $.state(true);

	let alerts = $.state($.proxy([]));
	let configInfo = $.state(null);
	let totalPages = $.state(0);
	let totalCount = $.state(0);
	let pageNo = $.state(1);
	let statusFilter = $.state("ALL");
	const limit = 20;

	// Delete dialog state
	let deleteDialogOpen = $.state(false);

	let alertToDelete = $.state(null);
	let deleteIncident = $.state(false);

	// Fetch config info
	async function fetchConfigInfo() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getMonitorAlertConfigById",
					data: { id: parseInt($.get(alertConfigId)) }
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(configInfo, result, true);
			}
		} catch(error) {
			console.error("Error fetching config info:", error);
		}
	}

	// Fetch alerts
	async function fetchAlerts() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getAllAlertsPaginated",
					data: {
						page: $.get(pageNo),
						limit,
						config_id: parseInt($.get(alertConfigId)),
						status: $.get(statusFilter)
					}
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(alerts, result.alerts || [], true);
				$.set(totalCount, result.total || 0, true);
				$.set(totalPages, Math.ceil($.get(totalCount) / limit), true);
			}
		} catch(error) {
			console.error("Error fetching alerts:", error);
		} finally {
			$.set(loading, false);
		}
	}

	// Update alert status
	async function updateAlertStatus(alertId, newStatus) {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "updateMonitorAlertV2Status",
					data: { id: alertId, status: newStatus }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(`Status updated to ${newStatus}`);
				await fetchAlerts();
			}
		} catch(error) {
			toast.error("Failed to update status");
		}
	}

	// Open delete dialog
	function openDeleteDialog(alert) {
		$.set(alertToDelete, alert, true);
		$.set(deleteIncident, false);
		$.set(deleteDialogOpen, true);
	}

	// Delete alert
	async function confirmDelete() {
		if (!$.get(alertToDelete)) return;

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "deleteMonitorAlertV2",
					data: {
						id: $.get(alertToDelete).id,
						deleteIncident: $.get(deleteIncident),
						incident_id: $.get(alertToDelete).incident_id
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Alert deleted successfully");
				await fetchAlerts();
			}
		} catch(error) {
			toast.error("Failed to delete alert");
		} finally {
			$.set(deleteDialogOpen, false);
			$.set(alertToDelete, null);
		}
	}

	// Format date
	function formatDate(dateStr) {
		try {
			const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;

			return format(date, "yyyy-MM-dd HH:mm:ss");
		} catch {
			return String(dateStr);
		}
	}

	// Handle filter change
	function handleStatusChange(value) {
		if (value) {
			$.set(statusFilter, value, true);
			$.set(pageNo, 1);
			fetchAlerts();
		}
	}

	// Pagination
	function goToPage(page) {
		$.set(pageNo, page, true);
		fetchAlerts();
	}

	onMount(async () => {
		await Promise.all([fetchConfigInfo(), fetchAlerts()]);
	});

	var fragment = root_12();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => clientResolver(resolve, "/manage/app/alerts"));

											$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
												Breadcrumb_Link($$anchor, {
													get href() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Alerts');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
								Breadcrumb_Separator($$anchor, {});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
								Breadcrumb_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
											Breadcrumb_Page($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Alert Logs');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var div_1 = $.sibling(node, 2);
	var node_7 = $.child(div_1);

	$.component(node_7, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(statusFilter);
			},
			onValueChange: handleStatusChange,
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_1();
				var node_8 = $.first_child(fragment_5);

				$.component(node_8, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'w-36',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(statusFilter) === "ALL" ? "All Status" : $.get(statusFilter)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_10 = $.first_child(fragment_7);

							$.component(node_10, () => Select.Item, ($$anchor, Select_Item) => {
								Select_Item($$anchor, {
									value: 'ALL',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('All Status');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Select.Item, ($$anchor, Select_Item_1) => {
								Select_Item_1($$anchor, {
									value: 'TRIGGERED',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Triggered');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Select.Item, ($$anchor, Select_Item_2) => {
								Select_Item_2($$anchor, {
									value: 'RESOLVED',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Resolved');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_13 = $.sibling(node_7, 2);

	{
		var consequent = ($$anchor) => {
			Spinner($$anchor, { class: 'size-5' });
		};

		$.if(node_13, ($$render) => {
			if ($.get(loading)) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_14 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_2();
			var node_15 = $.child(div_2);

			BellOffIcon(node_15, { class: 'text-muted-foreground size-16' });

			var div_3 = $.sibling(node_15, 2);
			var p = $.sibling($.child(div_3), 2);
			var text_6 = $.only_child(p, true);

			$.reset(div_3);
			$.reset(div_2);

			$.template_effect(($0) => $.set_text(text_6, $0), [
				() => $.get(statusFilter) !== "ALL"
					? `No ${$.get(statusFilter).toLowerCase()} alerts found.`
					: "This alert has not been triggered yet."
			]);

			$.append($$anchor, div_2);
		};

		var alternate_2 = ($$anchor) => {
			var div_4 = root_7();
			var node_16 = $.child(div_4);

			$.component(node_16, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root_1();
						var node_17 = $.first_child(fragment_9);

						$.component(node_17, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = $.comment();
									var node_18 = $.first_child(fragment_10);

									$.component(node_18, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_3();
												var node_19 = $.first_child(fragment_11);

												$.component(node_19, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														class: 'w-16',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('ID');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_19, 2);

												$.component(node_20, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														class: 'w-40',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Monitor');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														class: 'w-40',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Status');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_22 = $.sibling(node_21, 2);

												$.component(node_22, () => Table.Head, ($$anchor, Table_Head_3) => {
													Table_Head_3($$anchor, {
														class: 'w-32',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Incident');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => Table.Head, ($$anchor, Table_Head_4) => {
													Table_Head_4($$anchor, {
														class: 'w-44',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Created At');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												var node_24 = $.sibling(node_23, 2);

												$.component(node_24, () => Table.Head, ($$anchor, Table_Head_5) => {
													Table_Head_5($$anchor, {
														class: 'w-44',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('Updated At');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												var node_25 = $.sibling(node_24, 2);

												$.component(node_25, () => Table.Head, ($$anchor, Table_Head_6) => {
													Table_Head_6($$anchor, {
														class: 'w-20 text-right',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('Actions');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_26 = $.sibling(node_17, 2);

						$.component(node_26, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = $.comment();
									var node_27 = $.first_child(fragment_12);

									$.each(node_27, 17, () => $.get(alerts), (alert) => alert.id, ($$anchor, alert) => {
										var fragment_13 = $.comment();
										var node_28 = $.first_child(fragment_13);

										$.component(node_28, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												class: 'hover:bg-muted/50',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root_3();
													var node_29 = $.first_child(fragment_14);

													$.component(node_29, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															class: 'font-medium',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_14 = $.text();

																$.template_effect(() => $.set_text(text_14, $.get(alert).id));
																$.append($$anchor, text_14);
															},
															$$slots: { default: true }
														});
													});

													var node_30 = $.sibling(node_29, 2);

													$.component(node_30, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = $.comment();
																var node_31 = $.first_child(fragment_16);

																{
																	var consequent_2 = ($$anchor) => {
																		Badge($$anchor, {
																			variant: 'outline',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_15 = $.text();

																				$.template_effect(() => $.set_text(text_15, $.get(alert).monitor_tag));
																				$.append($$anchor, text_15);
																			},
																			$$slots: { default: true }
																		});
																	};

																	var alternate = ($$anchor) => {
																		var span = root_4();

																		$.append($$anchor, span);
																	};

																	$.if(node_31, ($$render) => {
																		if ($.get(alert).monitor_tag) $$render(consequent_2); else $$render(alternate, -1);
																	});
																}

																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													var node_32 = $.sibling(node_30, 2);

													$.component(node_32, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = $.comment();
																var node_33 = $.first_child(fragment_19);

																$.component(node_33, () => Select.Root, ($$anchor, Select_Root_1) => {
																	Select_Root_1($$anchor, {
																		type: 'single',
																		get value() {
																			return $.get(alert).alert_status;
																		},
																		onValueChange: (v) => v && updateAlertStatus($.get(alert).id, v),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_20 = root_1();
																			var node_34 = $.first_child(fragment_20);

																			$.component(node_34, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																				Select_Trigger_1($$anchor, {
																					class: 'h-8 w-32',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_16 = $.text();

																						$.template_effect(() => $.set_text(text_16, $.get(alert).alert_status));
																						$.append($$anchor, text_16);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_35 = $.sibling(node_34, 2);

																			$.component(node_35, () => Select.Content, ($$anchor, Select_Content_1) => {
																				Select_Content_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_22 = root_1();
																						var node_36 = $.first_child(fragment_22);

																						$.component(node_36, () => Select.Item, ($$anchor, Select_Item_3) => {
																							Select_Item_3($$anchor, {
																								value: 'TRIGGERED',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_17 = $.text('TRIGGERED');

																									$.append($$anchor, text_17);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_37 = $.sibling(node_36, 2);

																						$.component(node_37, () => Select.Item, ($$anchor, Select_Item_4) => {
																							Select_Item_4($$anchor, {
																								value: 'RESOLVED',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_18 = $.text('RESOLVED');

																									$.append($$anchor, text_18);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_22);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_20);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_19);
															},
															$$slots: { default: true }
														});
													});

													var node_38 = $.sibling(node_32, 2);

													$.component(node_38, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_23 = $.comment();
																var node_39 = $.first_child(fragment_23);

																{
																	var consequent_3 = ($$anchor) => {
																		var a = root_5();
																		var text_19 = $.child(a);
																		var node_40 = $.sibling(text_19);

																		ExternalLinkIcon(node_40, { class: 'size-3' });
																		$.reset(a);

																		$.template_effect(
																			($0) => {
																				$.set_attribute(a, 'href', $0);
																				$.set_text(text_19, `#${$.get(alert).incident_id ?? ''} `);
																			},
																			[
																				() => clientResolver(resolve, `/manage/app/incidents/${$.get(alert).incident_id}`)
																			]
																		);

																		$.append($$anchor, a);
																	};

																	var alternate_1 = ($$anchor) => {
																		var span_1 = root_4();

																		$.append($$anchor, span_1);
																	};

																	$.if(node_39, ($$render) => {
																		if ($.get(alert).incident_id) $$render(consequent_3); else $$render(alternate_1, -1);
																	});
																}

																$.append($$anchor, fragment_23);
															},
															$$slots: { default: true }
														});
													});

													var node_41 = $.sibling(node_38, 2);

													$.component(node_41, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															class: 'text-muted-foreground text-sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_20 = $.text();

																$.template_effect(($0) => $.set_text(text_20, $0), [() => formatDate($.get(alert).created_at)]);
																$.append($$anchor, text_20);
															},
															$$slots: { default: true }
														});
													});

													var node_42 = $.sibling(node_41, 2);

													$.component(node_42, () => Table.Cell, ($$anchor, Table_Cell_5) => {
														Table_Cell_5($$anchor, {
															class: 'text-muted-foreground text-sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_21 = $.text();

																$.template_effect(($0) => $.set_text(text_21, $0), [() => formatDate($.get(alert).updated_at)]);
																$.append($$anchor, text_21);
															},
															$$slots: { default: true }
														});
													});

													var node_43 = $.sibling(node_42, 2);

													$.component(node_43, () => Table.Cell, ($$anchor, Table_Cell_6) => {
														Table_Cell_6($$anchor, {
															class: 'text-right',
															children: ($$anchor, $$slotProps) => {
																Button($$anchor, {
																	variant: 'destructive',
																	size: 'sm',
																	class: 'text-xs',
																	onclick: () => openDeleteDialog($.get(alert)),
																	children: ($$anchor, $$slotProps) => {
																		var fragment_27 = root_6();
																		var node_44 = $.first_child(fragment_27);

																		TrashIcon(node_44, { class: 'size-3' });
																		$.next();
																		$.append($$anchor, fragment_27);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									});

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_14, ($$render) => {
			if (!$.get(loading) && $.get(alerts).length === 0) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	var node_45 = $.sibling(node_14, 2);

	{
		var consequent_7 = ($$anchor) => {
			const startItem = $.derived(() => ($.get(pageNo) - 1) * limit + 1);
			const endItem = $.derived(() => Math.min($.get(pageNo) * limit, $.get(totalCount)));
			var div_5 = root_10();
			var span_2 = $.child(div_5);
			var text_22 = $.only_child(span_2);
			var node_46 = $.sibling(span_2, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_6 = root_9();
					var node_47 = $.child(div_6);

					{
						let $0 = $.derived(() => $.get(pageNo) === 1);

						Button(node_47, {
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

					var div_7 = $.sibling(node_47, 2);

					$.each(div_7, 21, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), $.index, ($$anchor, page) => {
						var fragment_29 = $.comment();
						var node_48 = $.first_child(fragment_29);

						{
							var consequent_4 = ($$anchor) => {
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

											var text_23 = $.text();

											$.template_effect(() => $.set_text(text_23, $.get(page)));
											$.append($$anchor, text_23);
										},
										$$slots: { default: true }
									});
								}
							};

							var consequent_5 = ($$anchor) => {
								var span_3 = root_8();

								$.append($$anchor, span_3);
							};

							$.if(node_48, ($$render) => {
								if ($.get(page) === 1 || $.get(page) === $.get(totalPages) || $.get(page) >= $.get(pageNo) - 1 && $.get(page) <= $.get(pageNo) + 1) $$render(consequent_4); else if ($.get(page) === $.get(pageNo) - 2 || $.get(page) === $.get(pageNo) + 2) $$render(consequent_5, 1);
							});
						}

						$.append($$anchor, fragment_29);
					});

					$.reset(div_7);

					var node_49 = $.sibling(div_7, 2);

					{
						let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages));

						Button(node_49, {
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

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				$.if(node_46, ($$render) => {
					if ($.get(totalPages) > 1) $$render(consequent_6);
				});
			}

			$.reset(div_5);
			$.template_effect(() => $.set_text(text_22, `Showing ${$.get(startItem) ?? ''}-${$.get(endItem) ?? ''} of ${$.get(totalCount) ?? ''}`));
			$.append($$anchor, div_5);
		};

		$.if(node_45, ($$render) => {
			if ($.get(totalCount) > 0) $$render(consequent_7);
		});
	}

	$.reset(div);

	var node_50 = $.sibling(div, 2);

	$.component(node_50, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(deleteDialogOpen);
			},

			set open($$value) {
				$.set(deleteDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_33 = $.comment();
				var node_51 = $.first_child(fragment_33);

				$.component(node_51, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_34 = root();
							var node_52 = $.first_child(fragment_34);

							$.component(node_52, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_35 = root_1();
										var node_53 = $.first_child(fragment_35);

										$.component(node_53, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_24 = $.text('Delete Alert');

													$.append($$anchor, text_24);
												},
												$$slots: { default: true }
											});
										});

										var node_54 = $.sibling(node_53, 2);

										$.component(node_54, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Are you sure you want to delete this alert? This action cannot be undone.');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_35);
									},
									$$slots: { default: true }
								});
							});

							var node_55 = $.sibling(node_52, 2);

							{
								var consequent_8 = ($$anchor) => {
									var div_8 = root_11();
									var node_56 = $.child(div_8);

									Checkbox(node_56, {
										id: 'delete-incident',
										get checked() {
											return $.get(deleteIncident);
										},

										set checked($$value) {
											$.set(deleteIncident, $$value, true);
										}
									});

									var label = $.sibling(node_56, 2);
									var span_4 = $.sibling($.child(label));
									var text_26 = $.only_child(span_4);

									$.reset(label);
									$.reset(div_8);
									$.template_effect(() => $.set_text(text_26, `#${$.get(alertToDelete).incident_id ?? ''}`));
									$.append($$anchor, div_8);
								};

								$.if(node_55, ($$render) => {
									if ($.get(alertToDelete)?.incident_id) $$render(consequent_8);
								});
							}

							var node_57 = $.sibling(node_55, 2);

							$.component(node_57, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_36 = root_1();
										var node_58 = $.first_child(fragment_36);

										$.component(node_58, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_27 = $.text('Cancel');

													$.append($$anchor, text_27);
												},
												$$slots: { default: true }
											});
										});

										var node_59 = $.sibling(node_58, 2);

										$.component(node_59, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: confirmDelete,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_28 = $.text('Delete');

													$.append($$anchor, text_28);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_36);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_34);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_33);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}