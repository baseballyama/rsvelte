import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import PlusIcon from "@lucide/svelte/icons/plus";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import PencilIcon from "@lucide/svelte/icons/pencil";
import SirenIcon from "@lucide/svelte/icons/siren";
import { goto } from "$app/navigation";
import { formatDistanceToNow } from "date-fns";
import { formatDate } from "$lib/stores/datetime";
import GC from "$lib/global-constants";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> New Incident`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="line-clamp-1 max-w-xs"> </span>`);
var root_4 = $.from_html(`<p class="max-w-md"> </p>`);
var root_5 = $.from_html(`<span class="text-muted-foreground text-sm"> </span>`);
var root_6 = $.from_html(`<div class="text-sm"><span class="text-muted-foreground">From:</span> <br/> <span class="text-muted-foreground">To:</span> <!></div>`);
var root_7 = $.from_html(`<!> `, 1);
var root_8 = $.from_html(`<div class="flex items-center gap-2"><!></div>`);
var root_9 = $.from_html(`<div class="text-sm"><span class="font-medium"> </span> <span class="text-muted-foreground ml-1"> </span></div>`);
var root_10 = $.from_html(`<div class="space-y-1"></div>`);
var root_11 = $.from_html(`<span class="text-muted-foreground text-sm">None</span>`);
var root_12 = $.from_html(`<!> Edit`, 1);
var root_13 = $.from_html(`<span class="text-muted-foreground px-2">...</span>`);
var root_14 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_15 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"><!></div> <!></div>`);
var root_16 = $.from_html(`<div class="flex items-center justify-between"><p class="text-muted-foreground text-sm"> </p> <!></div>`);
var root_17 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><!> <!></div> <div class="flex items-center gap-3"><!></div></div> <div class="ktable rounded-2xl border"><!></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// State
	let loading = $.state(true);

	let incidents = $.state($.proxy([]));
	let totalPages = $.state(0);
	let totalCount = $.state(0);
	let pageNo = $.state(1);
	let stateFilter = $.state("ALL");
	const limit = 10;

	const stateOptions = [
		{ value: "ALL", label: "All States" },
		{ value: GC.INVESTIGATING, label: "Investigating" },
		{ value: GC.IDENTIFIED, label: "Identified" },
		{ value: GC.MONITORING, label: "Monitoring" },
		{ value: GC.RESOLVED, label: "Resolved" }
	];

	// Fetch incidents
	async function fetchData() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getIncidents",
					data: {
						page: $.get(pageNo),
						limit,
						filter: {
							status: "OPEN",
							state: $.get(stateFilter) === "ALL" ? undefined : $.get(stateFilter)
						}
					}
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(
					incidents,
					result.incidents.map((incident) => {
						// Calculate duration
						let duration;

						if (!incident.end_date_time) {
							duration = formatDistanceToNow(new Date(incident.start_date_time * 1000), { addSuffix: false });
						} else {
							const durationMs = (incident.end_date_time - incident.start_date_time) * 1000;

							duration = formatDuration(durationMs);
						}

						return { ...incident, duration };
					}),
					true
				);

				$.set(totalCount, result.total, true);
				$.set(totalPages, Math.ceil(result.total / limit), true);
			}
		} catch(error) {
			console.error("Error fetching incidents:", error);
		} finally {
			$.set(loading, false);
		}
	}

	// Format duration from milliseconds
	function formatDuration(ms) {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ${hours % 24}h`;
		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		if (minutes > 0) return `${minutes}m`;

		return `${seconds}s`;
	}

	// Get state badge variant
	function getStateBadgeVariant(state) {
		switch (state) {
			case GC.RESOLVED:
				return "default";

			case GC.MONITORING:
				return "secondary";

			case GC.IDENTIFIED:
				return "outline";

			case GC.INVESTIGATING:

			default:
				return "destructive";
		}
	}

	// Navigate to incident
	function openIncident(id) {
		goto(clientResolver(resolve, `/manage/app/incidents/${id}`));
	}

	// Create new incident
	function createNewIncident() {
		goto(clientResolver(resolve, "/manage/app/incidents/new"));
	}

	// Handle state filter change
	function handleStateFilterChange(value) {
		if (value) {
			$.set(stateFilter, value, true);
			$.set(pageNo, 1);
			fetchData();
		}
	}

	// Pagination
	function goToPage(page) {
		$.set(pageNo, page, true);
		fetchData();
	}

	$.user_effect(() => {
		fetchData();
	});

	var div = root_17();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(stateFilter);
			},
			onValueChange: handleStateFilterChange,
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'w-44',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(($0) => $.set_text(text, $0), [
								() => stateOptions.find((o) => o.value === $.get(stateFilter))?.label || "All States"
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
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.each(node_3, 17, () => stateOptions, $.index, ($$anchor, option) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(option).value;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(option).label));
											$.append($$anchor, text_1);
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

	var node_5 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Spinner($$anchor, { class: 'size-5' });
		};

		$.if(node_5, ($$render) => {
			if ($.get(loading)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	Button(node_6, {
		onclick: createNewIncident,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_1();
			var node_7 = $.first_child(fragment_6);

			PlusIcon(node_7, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_8 = $.child(div_4);

	$.component(node_8, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root();
				var node_9 = $.first_child(fragment_7);

				$.component(node_9, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_10 = $.first_child(fragment_8);

							$.component(node_10, () => Table.Row, ($$anchor, Table_Row) => {
								Table_Row($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_2();
										var node_11 = $.first_child(fragment_9);

										$.component(node_11, () => Table.Head, ($$anchor, Table_Head) => {
											Table_Head($$anchor, {
												class: 'w-16',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('ID');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => Table.Head, ($$anchor, Table_Head_1) => {
											Table_Head_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Title');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Table.Head, ($$anchor, Table_Head_2) => {
											Table_Head_2($$anchor, {
												class: 'w-40',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Started');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => Table.Head, ($$anchor, Table_Head_3) => {
											Table_Head_3($$anchor, {
												class: 'w-32',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Duration');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Table.Head, ($$anchor, Table_Head_4) => {
											Table_Head_4($$anchor, {
												class: 'w-36',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('State');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Table.Head, ($$anchor, Table_Head_5) => {
											Table_Head_5($$anchor, {
												class: 'w-40',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Affects');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Table.Head, ($$anchor, Table_Head_6) => {
											Table_Head_6($$anchor, {
												class: 'w-24 text-right',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Actions');

													$.append($$anchor, text_8);
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

				var node_18 = $.sibling(node_9, 2);

				$.component(node_18, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = $.comment();
							var node_19 = $.first_child(fragment_10);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_20 = $.first_child(fragment_11);

									$.component(node_20, () => Table.Row, ($$anchor, Table_Row_1) => {
										Table_Row_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = $.comment();
												var node_21 = $.first_child(fragment_12);

												$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														colspan: 7,
														class: 'text-muted-foreground py-8 text-center',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('No incidents found');

															$.append($$anchor, text_9);
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
									var fragment_13 = $.comment();
									var node_22 = $.first_child(fragment_13);

									$.each(node_22, 17, () => $.get(incidents), $.index, ($$anchor, incident) => {
										var fragment_14 = $.comment();
										var node_23 = $.first_child(fragment_14);

										$.component(node_23, () => Table.Row, ($$anchor, Table_Row_2) => {
											Table_Row_2($$anchor, {
												class: 'hover:bg-muted/50 cursor-pointer',
												onclick: () => openIncident($.get(incident).id),
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_2();
													var node_24 = $.first_child(fragment_15);

													$.component(node_24, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															class: 'font-medium',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text();

																$.template_effect(() => $.set_text(text_10, $.get(incident).id));
																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});
													});

													var node_25 = $.sibling(node_24, 2);

													$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = $.comment();
																var node_26 = $.first_child(fragment_17);

																$.component(node_26, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																	Tooltip_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = root();
																			var node_27 = $.first_child(fragment_18);

																			$.component(node_27, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																				Tooltip_Trigger($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var span = root_3();
																						var text_11 = $.only_child(span, true);

																						$.template_effect(() => $.set_text(text_11, $.get(incident).title));
																						$.append($$anchor, span);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_28 = $.sibling(node_27, 2);

																			$.component(node_28, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																				Tooltip_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var p_1 = root_4();
																						var text_12 = $.only_child(p_1, true);

																						$.template_effect(() => $.set_text(text_12, $.get(incident).title));
																						$.append($$anchor, p_1);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_18);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													var node_29 = $.sibling(node_25, 2);

													$.component(node_29, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var span_1 = root_5();
																var text_13 = $.only_child(span_1, true);

																$.template_effect(($0) => $.set_text(text_13, $0), [
																	() => $formatDate()($.get(incident).start_date_time, "yyyy-MM-dd HH:mm")
																]);

																$.append($$anchor, span_1);
															},
															$$slots: { default: true }
														});
													});

													var node_30 = $.sibling(node_29, 2);

													$.component(node_30, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = $.comment();
																var node_31 = $.first_child(fragment_19);

																$.component(node_31, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																	Tooltip_Root_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_20 = root();
																			var node_32 = $.first_child(fragment_20);

																			$.component(node_32, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																				Tooltip_Trigger_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var span_2 = root_5();
																						var text_14 = $.only_child(span_2, true);

																						$.template_effect(() => $.set_text(text_14, $.get(incident).duration));
																						$.append($$anchor, span_2);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_33 = $.sibling(node_32, 2);

																			$.component(node_33, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																				Tooltip_Content_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var div_5 = root_6();
																						var text_15 = $.sibling($.child(div_5));
																						var node_34 = $.sibling(text_15, 5);

																						{
																							var consequent_2 = ($$anchor) => {
																								var text_16 = $.text();

																								$.template_effect(($0) => $.set_text(text_16, $0), [
																									() => $formatDate()($.get(incident).end_date_time, "yyyy-MM-dd HH:mm")
																								]);

																								$.append($$anchor, text_16);
																							};

																							var alternate = ($$anchor) => {
																								var text_17 = $.text('Ongoing');

																								$.append($$anchor, text_17);
																							};

																							$.if(node_34, ($$render) => {
																								if ($.get(incident).end_date_time) $$render(consequent_2); else $$render(alternate, -1);
																							});
																						}

																						$.reset(div_5);

																						$.template_effect(($0) => $.set_text(text_15, ` ${$0 ?? ''} `), [
																							() => $formatDate()($.get(incident).start_date_time, "yyyy-MM-dd HH:mm")
																						]);

																						$.append($$anchor, div_5);
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

													var node_35 = $.sibling(node_30, 2);

													$.component(node_35, () => Table.Cell, ($$anchor, Table_Cell_5) => {
														Table_Cell_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var div_6 = root_8();
																var node_36 = $.child(div_6);

																{
																	let $0 = $.derived(() => getStateBadgeVariant($.get(incident).state));

																	Badge(node_36, {
																		get variant() {
																			return $.get($0);
																		},
																		class: 'gap-1',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_22 = root_7();
																			var node_37 = $.first_child(fragment_22);

																			SirenIcon(node_37, { class: 'size-3' });

																			var text_18 = $.sibling(node_37);

																			$.template_effect(() => $.set_text(text_18, ` ${$.get(incident).state ?? ''}`));
																			$.append($$anchor, fragment_22);
																		},
																		$$slots: { default: true }
																	});
																}

																$.reset(div_6);
																$.append($$anchor, div_6);
															},
															$$slots: { default: true }
														});
													});

													var node_38 = $.sibling(node_35, 2);

													$.component(node_38, () => Table.Cell, ($$anchor, Table_Cell_6) => {
														Table_Cell_6($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_23 = $.comment();
																var node_39 = $.first_child(fragment_23);

																{
																	var consequent_3 = ($$anchor) => {
																		var fragment_24 = $.comment();
																		var node_40 = $.first_child(fragment_24);

																		$.component(node_40, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
																			Tooltip_Root_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_25 = root();
																					var node_41 = $.first_child(fragment_25);

																					$.component(node_41, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
																						Tooltip_Trigger_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								Badge($$anchor, {
																									variant: 'outline',
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_19 = $.text();

																										$.template_effect(() => $.set_text(text_19, `${$.get(incident).monitors.length ?? ''} monitor(s)`));
																										$.append($$anchor, text_19);
																									},
																									$$slots: { default: true }
																								});
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_42 = $.sibling(node_41, 2);

																					$.component(node_42, () => Tooltip.Content, ($$anchor, Tooltip_Content_2) => {
																						Tooltip_Content_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var div_7 = root_10();

																								$.each(div_7, 21, () => $.get(incident).monitors, $.index, ($$anchor, monitor) => {
																									var div_8 = root_9();
																									var span_3 = $.child(div_8);
																									var text_20 = $.only_child(span_3, true);
																									var span_4 = $.sibling(span_3, 2);
																									var text_21 = $.only_child(span_4);

																									$.reset(div_8);

																									$.template_effect(() => {
																										$.set_text(text_20, $.get(monitor).tag || $.get(monitor).monitor_tag);
																										$.set_text(text_21, `(${($.get(monitor).impact_type || $.get(monitor).monitor_impact) ?? ''})`);
																									});

																									$.append($$anchor, div_8);
																								});

																								$.reset(div_7);
																								$.append($$anchor, div_7);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_25);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_24);
																	};

																	var alternate_1 = ($$anchor) => {
																		var span_5 = root_11();

																		$.append($$anchor, span_5);
																	};

																	$.if(node_39, ($$render) => {
																		if ($.get(incident).monitors && $.get(incident).monitors.length > 0) $$render(consequent_3); else $$render(alternate_1, -1);
																	});
																}

																$.append($$anchor, fragment_23);
															},
															$$slots: { default: true }
														});
													});

													var node_43 = $.sibling(node_38, 2);

													$.component(node_43, () => Table.Cell, ($$anchor, Table_Cell_7) => {
														Table_Cell_7($$anchor, {
															class: 'text-right',
															children: ($$anchor, $$slotProps) => {
																Button($$anchor, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: (e) => {
																		e.stopPropagation();
																		openIncident($.get(incident).id);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_29 = root_12();
																		var node_44 = $.first_child(fragment_29);

																		PencilIcon(node_44, { class: 'size-4' });
																		$.next();
																		$.append($$anchor, fragment_29);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_14);
									});

									$.append($$anchor, fragment_13);
								};

								$.if(node_19, ($$render) => {
									if ($.get(incidents).length === 0 && !$.get(loading)) $$render(consequent_1); else $$render(alternate_2, -1);
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

	$.reset(div_4);

	var node_45 = $.sibling(div_4, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_9 = root_16();
			var p_2 = $.child(div_9);
			var text_22 = $.only_child(p_2);
			var node_46 = $.sibling(p_2, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_10 = root_15();
					var node_47 = $.child(div_10);

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

					var div_11 = $.sibling(node_47, 2);
					var node_48 = $.child(div_11);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_31 = $.comment();
							var node_49 = $.first_child(fragment_31);

							$.each(node_49, 17, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), $.index, ($$anchor, page) => {
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
							});

							$.append($$anchor, fragment_31);
						};

						var alternate_3 = ($$anchor) => {
							var fragment_34 = root_14();
							var node_50 = $.first_child(fragment_34);

							{
								let $0 = $.derived(() => $.get(pageNo) === 1 ? "default" : "ghost");

								Button(node_50, {
									get variant() {
										return $.get($0);
									},
									size: 'sm',
									onclick: () => goToPage(1),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_24 = $.text('1');

										$.append($$anchor, text_24);
									},
									$$slots: { default: true }
								});
							}

							var node_51 = $.sibling(node_50, 2);

							{
								var consequent_5 = ($$anchor) => {
									var span_6 = root_13();

									$.append($$anchor, span_6);
								};

								$.if(node_51, ($$render) => {
									if ($.get(pageNo) > 3) $$render(consequent_5);
								});
							}

							var node_52 = $.sibling(node_51, 2);

							$.each(node_52, 16, () => Array.from({ length: 3 }, (_, i) => $.get(pageNo) - 1 + i).filter((p) => p > 1 && p < $.get(totalPages)), $.index, ($$anchor, page) => {
								{
									let $0 = $.derived(() => page === $.get(pageNo) ? "default" : "ghost");

									Button($$anchor, {
										get variant() {
											return $.get($0);
										},
										size: 'sm',
										onclick: () => goToPage(page),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_25 = $.text();

											$.template_effect(() => $.set_text(text_25, page));
											$.append($$anchor, text_25);
										},
										$$slots: { default: true }
									});
								}
							});

							var node_53 = $.sibling(node_52, 2);

							{
								var consequent_6 = ($$anchor) => {
									var span_7 = root_13();

									$.append($$anchor, span_7);
								};

								$.if(node_53, ($$render) => {
									if ($.get(pageNo) < $.get(totalPages) - 2) $$render(consequent_6);
								});
							}

							var node_54 = $.sibling(node_53, 2);

							{
								let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages) ? "default" : "ghost");

								Button(node_54, {
									get variant() {
										return $.get($0);
									},
									size: 'sm',
									onclick: () => goToPage($.get(totalPages)),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_26 = $.text();

										$.template_effect(() => $.set_text(text_26, $.get(totalPages)));
										$.append($$anchor, text_26);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_34);
						};

						$.if(node_48, ($$render) => {
							if ($.get(totalPages) <= 7) $$render(consequent_4); else $$render(alternate_3, -1);
						});
					}

					$.reset(div_11);

					var node_55 = $.sibling(div_11, 2);

					{
						let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages));

						Button(node_55, {
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

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_46, ($$render) => {
					if ($.get(totalPages) > 1) $$render(consequent_7);
				});
			}

			$.reset(div_9);
			$.template_effect(($0) => $.set_text(text_22, `Showing ${($.get(pageNo) - 1) * limit + 1} - ${$0 ?? ''} of ${$.get(totalCount) ?? ''} incidents`), [() => Math.min($.get(pageNo) * limit, $.get(totalCount))]);
			$.append($$anchor, div_9);
		};

		$.if(node_45, ($$render) => {
			if ($.get(totalPages) > 0) $$render(consequent_8);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}