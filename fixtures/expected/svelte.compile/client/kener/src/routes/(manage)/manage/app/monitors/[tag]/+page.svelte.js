import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Alert from "$lib/components/ui/alert/index.js";
import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import * as Accordion from "$lib/components/ui/accordion/index.js";
import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as HoverCard from "$lib/components/ui/hover-card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";
import GeneralSettingsCard from "./components/GeneralSettingsCard.svelte";
import MonitorTypeCard from "./components/MonitorTypeCard.svelte";
import UptimeSettingsCard from "./components/UptimeSettingsCard.svelte";
import PageVisibilityCard from "./components/PageVisibilityCard.svelte";
import ModifyDataCard from "./components/ModifyDataCard.svelte";
import DangerZoneCard from "./components/DangerZoneCard.svelte";
import MonitorRecentLogs from "./components/MonitorRecentLogs.svelte";
import StatusHistoryDaysCard from "./components/StatusHistoryDaysCard.svelte";
import MonitorSharingOptionsCard from "./components/MonitorSharingOptionsCard.svelte";
import GC from "$lib/global-constants.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p class="text-destructive">This monitor is hidden and won't appear on status pages.</p>`);
var root_2 = $.from_html(`<p class="text-destructive">This monitor is not active and won't appear on status pages.</p>`);
var root_3 = $.from_html(`<p class="text-success">This monitor is visible on status pages.</p>`);
var root_4 = $.from_html(`<div class="flex justify-between space-x-4 text-xs"><!> <p class="text-xs"></p></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_7 = $.from_html(`<p class="text-destructive"> </p>`);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> Cloning...`, 1);
var root_10 = $.from_html(`<!> <div class="space-y-4 py-2"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <!>`, 1);
var root_11 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><div class="mb-4 flex items-center justify-between"><!> <div class="flex gap-2"><!> <!></div></div> <!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Card components
	const isNew = $.derived(() => $$props.params.tag === "new");

	// Form state
	let loading = $.state(true);

	let error = $.state(null);
	let availableMonitors = $.state($.proxy([]));
	let subMenuOptions = $.state(null);

	// Uptime settings state
	let uptimeSettings = $.state($.proxy({
		uptime_formula_numerator: "up + maintenance",
		uptime_formula_denominator: "up + maintenance + down + degraded"
	}));

	// Status history days state
	let statusHistoryDays = $.state($.proxy({
		desktop: GC.DEFAULT_STATUS_HISTORY_DAYS_DESKTOP,
		mobile: GC.DEFAULT_STATUS_HISTORY_DAYS_MOBILE
	}));

	// Pages state
	let allPages = $.state($.proxy([]));

	// Monitor data
	let monitor = $.state($.proxy({
		id: 0,
		tag: "",
		name: "",
		description: "",
		image: "",
		cron: "* * * * *",
		default_status: "UP",
		status: "ACTIVE",
		category_name: "Home",
		monitor_type: "",
		is_hidden: "NO",
		confirmation_threshold: 1,
		monitor_settings_json: "",
		external_url: ""
	}));

	// Type-specific data
	let typeData = $.state($.proxy({}));

	// Get pages this monitor is on
	const monitorPages = $.derived(() => $.get(allPages).filter((p) => p.monitors?.some((m) => m.monitor_tag === $.get(monitor).tag)));

	async function fetchMonitor() {
		if ($.get(isNew)) {
			$.set(loading, false);

			return;
		}

		$.set(loading, true);
		$.set(error, null);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getMonitors", data: { tag: $$props.params.tag } })
			});

			const result = await response.json();

			if (result.error) {
				$.set(error, result.error, true);
			} else if (result.length > 0) {
				const m = result[0];

				$.set(
					monitor,
					{
						id: m.id,
						tag: m.tag,
						name: m.name,
						description: m.description || "",
						image: m.image || "",
						cron: m.cron || "* * * * *",
						default_status: m.default_status || "UP",
						status: m.status || "ACTIVE",
						category_name: m.category_name || "Home",
						monitor_type: m.monitor_type || "",
						is_hidden: m.is_hidden || "NO",
						confirmation_threshold: m.confirmation_threshold ?? 1,
						monitor_settings_json: m.monitor_settings_json || "",
						external_url: m.external_url || ""
					},
					true
				);

				// Parse type_data
				if (m.type_data) {
					try {
						$.set(typeData, JSON.parse(m.type_data), true);
					} catch(e) {
						console.error("Failed to parse type_data:", e);
						$.set(typeData, {}, true);
					}
				}

				// Parse monitor_settings_json
				if (m.monitor_settings_json) {
					try {
						const settings = JSON.parse(m.monitor_settings_json);

						$.set(
							uptimeSettings,
							{
								uptime_formula_numerator: settings.uptime_formula_numerator || "up + maintenance",
								uptime_formula_denominator: settings.uptime_formula_denominator || "up + maintenance + down + degraded"
							},
							true
						);

						if (settings.monitor_status_history_days) {
							$.set(
								statusHistoryDays,
								{
									desktop: settings.monitor_status_history_days.desktop ?? GC.DEFAULT_STATUS_HISTORY_DAYS_DESKTOP,
									mobile: settings.monitor_status_history_days.mobile ?? GC.DEFAULT_STATUS_HISTORY_DAYS_MOBILE
								},
								true
							);
						}
					} catch(e) {
						console.error("Failed to parse monitor_settings_json:", e);
					}
				}
			} else {
				$.set(error, "Monitor not found");
			}
		} catch(e) {
			$.set(error, e instanceof Error ? e.message : "Failed to fetch monitor", true);
		} finally {
			$.set(loading, false);
		}
	}

	async function fetchAvailableMonitors() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getMonitors", data: { status: "ACTIVE" } })
			});

			const result = await response.json();

			if (!result.error) {
				$.set(availableMonitors, result, true);
			}
		} catch {
			// Ignore errors for available monitors
		}
	}

	async function fetchPages() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getPages" })
			});

			const result = await response.json();

			if (!result.error) {
				$.set(allPages, result, true);
			}
		} catch {
			// Ignore errors for pages
		}
	}

	//fetch sharing options from site data
	async function getSiteLevelSharingConfig() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getSiteDataByKey", data: { key: "subMenuOptions" } })
			});

			const result = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			$.set(subMenuOptions, result, true);
		} catch(e) {
			console.error("Failed to fetch site level sharing config:", e);

			return {};
		}
	}

	$.user_effect(() => {
		fetchMonitor();
		fetchAvailableMonitors();
		fetchPages();
		getSiteLevelSharingConfig();
	});

	let activeAccordionItem = $.derived(() => $.get(isNew) ? "general" : "configuration");
	let cloneDialogOpen = $.state(false);
	let cloneTag = $.state("");
	let cloneName = $.state("");
	let cloning = $.state(false);

	function openCloneDialog() {
		$.set(cloneTag, "");
		$.set(cloneName, $.get(monitor).name ? `${$.get(monitor).name} Copy` : "Copy", true);
		$.set(cloneDialogOpen, true);
	}

	async function cloneMonitor() {
		const newTag = $.get(cloneTag).trim();
		const newName = $.get(cloneName).trim();

		if (!newTag || !newName) {
			toast.error("Tag and name are required");

			return;
		}

		$.set(cloning, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "cloneMonitor",
					data: { sourceTag: $.get(monitor).tag, newTag, newName }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);

				return;
			}

			toast.success("Monitor cloned successfully");
			$.set(cloneDialogOpen, false);
			goto(clientResolver(resolve, `/manage/app/monitors/${newTag}`));
		} catch(e) {
			const message = e instanceof Error ? e.message : "Failed to clone monitor";

			toast.error(message);
		} finally {
			$.set(cloning, false);
		}
	}

	var fragment = root_11();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

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
											let $0 = $.derived(() => clientResolver(resolve, "/manage/app/monitors"));

											$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
												Breadcrumb_Link($$anchor, {
													get href() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Monitors');

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

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(isNew)
														? "New Monitor"
														: $.get(monitor).name || $$props.params.tag));

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

	var div_2 = $.sibling(node, 2);
	var node_7 = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				size: 'sm',
				variant: 'outline',
				onclick: openCloneDialog,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Clone');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_7, ($$render) => {
			if (!$.get(isNew)) $$render(consequent);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	$.component(node_8, () => HoverCard.Root, ($$anchor, HoverCard_Root) => {
		HoverCard_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_5();
				var node_9 = $.first_child(fragment_7);

				$.component(node_9, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger) => {
					HoverCard_Trigger($$anchor, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => clientResolver(resolve, `/monitors/${$$props.params.tag}`));

								Button($$anchor, {
									size: 'sm',
									target: '_blank',
									get href() {
										return $.get($0);
									},
									variant: 'outline',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('View');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => HoverCard.Content, ($$anchor, HoverCard_Content) => {
					HoverCard_Content($$anchor, {
						class: 'w-80',
						children: ($$anchor, $$slotProps) => {
							var div_3 = root_4();
							var node_11 = $.child(div_3);

							{
								var consequent_1 = ($$anchor) => {
									var p_1 = root_1();

									$.append($$anchor, p_1);
								};

								var consequent_2 = ($$anchor) => {
									var p_2 = root_2();

									$.append($$anchor, p_2);
								};

								var alternate = ($$anchor) => {
									var p_3 = root_3();

									$.append($$anchor, p_3);
								};

								$.if(node_11, ($$render) => {
									if ($.get(monitor).is_hidden === "YES") $$render(consequent_1); else if ($.get(monitor).status !== "ACTIVE") $$render(consequent_2, 1); else $$render(alternate, -1);
								});
							}

							$.next(2);
							$.reset(div_3);
							$.append($$anchor, div_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);
	$.reset(div_1);

	var node_12 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_4 = root_6();
			var node_13 = $.child(div_4);

			Spinner(node_13, { class: 'size-8' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_9 = $.comment();
			var node_14 = $.first_child(fragment_9);

			$.component(node_14, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'border-destructive',
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = $.comment();
						var node_15 = $.first_child(fragment_10);

						$.component(node_15, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'pt-6',
								children: ($$anchor, $$slotProps) => {
									var p_4 = root_7();
									var text_4 = $.only_child(p_4, true);

									$.template_effect(() => $.set_text(text_4, $.get(error)));
									$.append($$anchor, p_4);
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
		};

		var alternate_1 = ($$anchor) => {
			var fragment_11 = root_5();
			var node_16 = $.first_child(fragment_11);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_12 = $.comment();
					var node_17 = $.first_child(fragment_12);

					$.component(node_17, () => Alert.Root, ($$anchor, Alert_Root) => {
						Alert_Root($$anchor, {
							variant: 'destructive',
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = root();
								var node_18 = $.first_child(fragment_13);

								AlertTriangleIcon(node_18, { class: 'size-4' });

								var node_19 = $.sibling(node_18, 2);

								$.component(node_19, () => Alert.Title, ($$anchor, Alert_Title) => {
									Alert_Title($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Monitor Not Visible');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								});

								var node_20 = $.sibling(node_19, 2);

								$.component(node_20, () => Alert.Description, ($$anchor, Alert_Description) => {
									Alert_Description($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('This monitor is not added to any page. It won\'t be visible on your status page until you add it to at least\n          one page.');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_12);
				};

				$.if(node_16, ($$render) => {
					if (!$.get(isNew) && $.get(monitorPages).length === 0) $$render(consequent_5);
				});
			}

			var node_21 = $.sibling(node_16, 2);

			$.component(node_21, () => Accordion.Root, ($$anchor, Accordion_Root) => {
				Accordion_Root($$anchor, {
					type: 'single',
					class: 'w-full ',
					onValueChange: (value) => $.set(activeAccordionItem, value),
					get value() {
						return $.get(activeAccordionItem);
					},

					set value($$value) {
						$.set(activeAccordionItem, $$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_14 = root_8();
						var node_22 = $.first_child(fragment_14);

						$.component(node_22, () => Accordion.Item, ($$anchor, Accordion_Item) => {
							Accordion_Item($$anchor, {
								value: 'general',
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_5();
									var node_23 = $.first_child(fragment_15);

									$.component(node_23, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
										Accordion_Trigger($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('General Settings');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_24 = $.sibling(node_23, 2);

									$.component(node_24, () => Accordion.Content, ($$anchor, Accordion_Content) => {
										Accordion_Content($$anchor, {
											class: 'flex flex-col gap-4 text-balance',
											children: ($$anchor, $$slotProps) => {
												GeneralSettingsCard($$anchor, {
													get typeData() {
														return $.get(typeData);
													},

													get isNew() {
														return $.get(isNew);
													},

													get monitor() {
														return $.get(monitor);
													},

													set monitor($$value) {
														$.set(monitor, $$value, true);
													}
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

						var node_25 = $.sibling(node_22, 2);

						{
							var consequent_6 = ($$anchor) => {
								var fragment_17 = $.comment();
								var node_26 = $.first_child(fragment_17);

								$.component(node_26, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
									Accordion_Item_1($$anchor, {
										value: 'configuration',
										children: ($$anchor, $$slotProps) => {
											var fragment_18 = root_5();
											var node_27 = $.first_child(fragment_18);

											$.component(node_27, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_1) => {
												Accordion_Trigger_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Configuration');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											});

											var node_28 = $.sibling(node_27, 2);

											$.component(node_28, () => Accordion.Content, ($$anchor, Accordion_Content_1) => {
												Accordion_Content_1($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														MonitorTypeCard($$anchor, {
															get availableMonitors() {
																return $.get(availableMonitors);
															},

															get monitor() {
																return $.get(monitor);
															},

															set monitor($$value) {
																$.set(monitor, $$value, true);
															},

															get typeData() {
																return $.get(typeData);
															},

															set typeData($$value) {
																$.set(typeData, $$value, true);
															}
														});
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
							};

							$.if(node_25, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_6);
							});
						}

						var node_29 = $.sibling(node_25, 2);

						{
							var consequent_7 = ($$anchor) => {
								var fragment_20 = $.comment();
								var node_30 = $.first_child(fragment_20);

								$.component(node_30, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
									Accordion_Item_2($$anchor, {
										value: 'calculation',
										children: ($$anchor, $$slotProps) => {
											var fragment_21 = root_5();
											var node_31 = $.first_child(fragment_21);

											$.component(node_31, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_2) => {
												Accordion_Trigger_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Uptime Calculation');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});
											});

											var node_32 = $.sibling(node_31, 2);

											$.component(node_32, () => Accordion.Content, ($$anchor, Accordion_Content_2) => {
												Accordion_Content_2($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														UptimeSettingsCard($$anchor, {
															get monitor() {
																return $.get(monitor);
															},

															get typeData() {
																return $.get(typeData);
															},

															get uptimeSettings() {
																return $.get(uptimeSettings);
															},

															set uptimeSettings($$value) {
																$.set(uptimeSettings, $$value, true);
															}
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_21);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_20);
							};

							$.if(node_29, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_7);
							});
						}

						var node_33 = $.sibling(node_29, 2);

						{
							var consequent_8 = ($$anchor) => {
								var fragment_23 = $.comment();
								var node_34 = $.first_child(fragment_23);

								$.component(node_34, () => Accordion.Item, ($$anchor, Accordion_Item_3) => {
									Accordion_Item_3($$anchor, {
										value: 'status-history',
										children: ($$anchor, $$slotProps) => {
											var fragment_24 = root_5();
											var node_35 = $.first_child(fragment_24);

											$.component(node_35, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_3) => {
												Accordion_Trigger_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('Status History');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});
											});

											var node_36 = $.sibling(node_35, 2);

											$.component(node_36, () => Accordion.Content, ($$anchor, Accordion_Content_3) => {
												Accordion_Content_3($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														StatusHistoryDaysCard($$anchor, {
															get typeData() {
																return $.get(typeData);
															},

															get monitor() {
																return $.get(monitor);
															},

															set monitor($$value) {
																$.set(monitor, $$value, true);
															},

															get statusHistoryDays() {
																return $.get(statusHistoryDays);
															},

															set statusHistoryDays($$value) {
																$.set(statusHistoryDays, $$value, true);
															}
														});
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
							};

							$.if(node_33, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_8);
							});
						}

						var node_37 = $.sibling(node_33, 2);

						{
							var consequent_9 = ($$anchor) => {
								var fragment_26 = $.comment();
								var node_38 = $.first_child(fragment_26);

								$.component(node_38, () => Accordion.Item, ($$anchor, Accordion_Item_4) => {
									Accordion_Item_4($$anchor, {
										value: 'logs-recent',
										children: ($$anchor, $$slotProps) => {
											var fragment_27 = root_5();
											var node_39 = $.first_child(fragment_27);

											$.component(node_39, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_4) => {
												Accordion_Trigger_4($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text('Recent Logs');

														$.append($$anchor, text_11);
													},
													$$slots: { default: true }
												});
											});

											var node_40 = $.sibling(node_39, 2);

											$.component(node_40, () => Accordion.Content, ($$anchor, Accordion_Content_4) => {
												Accordion_Content_4($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														MonitorRecentLogs($$anchor, {
															get monitor_tag() {
																return $$props.params.tag;
															}
														});
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

							$.if(node_37, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_9);
							});
						}

						var node_41 = $.sibling(node_37, 2);

						{
							var consequent_10 = ($$anchor) => {
								var fragment_29 = $.comment();
								var node_42 = $.first_child(fragment_29);

								$.component(node_42, () => Accordion.Item, ($$anchor, Accordion_Item_5) => {
									Accordion_Item_5($$anchor, {
										value: 'pages-visibility',
										children: ($$anchor, $$slotProps) => {
											var fragment_30 = root_5();
											var node_43 = $.first_child(fragment_30);

											$.component(node_43, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_5) => {
												Accordion_Trigger_5($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_12 = $.text('Page Visibility');

														$.append($$anchor, text_12);
													},
													$$slots: { default: true }
												});
											});

											var node_44 = $.sibling(node_43, 2);

											$.component(node_44, () => Accordion.Content, ($$anchor, Accordion_Content_5) => {
												Accordion_Content_5($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														PageVisibilityCard($$anchor, {
															get monitorTag() {
																return $.get(monitor).tag;
															},

															get allPages() {
																return $.get(allPages);
															},
															onPagesUpdated: fetchPages
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_30);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_29);
							};

							$.if(node_41, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_10);
							});
						}

						var node_45 = $.sibling(node_41, 2);

						{
							var consequent_11 = ($$anchor) => {
								var fragment_32 = $.comment();
								var node_46 = $.first_child(fragment_32);

								$.component(node_46, () => Accordion.Item, ($$anchor, Accordion_Item_6) => {
									Accordion_Item_6($$anchor, {
										value: 'sharing-options',
										children: ($$anchor, $$slotProps) => {
											var fragment_33 = root_5();
											var node_47 = $.first_child(fragment_33);

											$.component(node_47, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_6) => {
												Accordion_Trigger_6($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_13 = $.text('Sharing Options');

														$.append($$anchor, text_13);
													},
													$$slots: { default: true }
												});
											});

											var node_48 = $.sibling(node_47, 2);

											$.component(node_48, () => Accordion.Content, ($$anchor, Accordion_Content_6) => {
												Accordion_Content_6($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														MonitorSharingOptionsCard($$anchor, {
															get typeData() {
																return $.get(typeData);
															},

															get subMenuOptions() {
																return $.get(subMenuOptions);
															},

															get monitor() {
																return $.get(monitor);
															},

															set monitor($$value) {
																$.set(monitor, $$value, true);
															}
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_33);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_32);
							};

							$.if(node_45, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_11);
							});
						}

						var node_49 = $.sibling(node_45, 2);

						{
							var consequent_12 = ($$anchor) => {
								var fragment_35 = $.comment();
								var node_50 = $.first_child(fragment_35);

								$.component(node_50, () => Accordion.Item, ($$anchor, Accordion_Item_7) => {
									Accordion_Item_7($$anchor, {
										value: 'modify-data',
										children: ($$anchor, $$slotProps) => {
											var fragment_36 = root_5();
											var node_51 = $.first_child(fragment_36);

											$.component(node_51, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_7) => {
												Accordion_Trigger_7($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_14 = $.text('Modify Data');

														$.append($$anchor, text_14);
													},
													$$slots: { default: true }
												});
											});

											var node_52 = $.sibling(node_51, 2);

											$.component(node_52, () => Accordion.Content, ($$anchor, Accordion_Content_7) => {
												Accordion_Content_7($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														ModifyDataCard($$anchor, {
															get monitorTag() {
																return $.get(monitor).tag;
															}
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_36);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_35);
							};

							$.if(node_49, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_12);
							});
						}

						var node_53 = $.sibling(node_49, 2);

						{
							var consequent_13 = ($$anchor) => {
								var fragment_38 = $.comment();
								var node_54 = $.first_child(fragment_38);

								$.component(node_54, () => Accordion.Item, ($$anchor, Accordion_Item_8) => {
									Accordion_Item_8($$anchor, {
										value: 'danger-zone',
										children: ($$anchor, $$slotProps) => {
											var fragment_39 = root_5();
											var node_55 = $.first_child(fragment_39);

											$.component(node_55, () => Accordion.Trigger, ($$anchor, Accordion_Trigger_8) => {
												Accordion_Trigger_8($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_15 = $.text('Danger Zone');

														$.append($$anchor, text_15);
													},
													$$slots: { default: true }
												});
											});

											var node_56 = $.sibling(node_55, 2);

											$.component(node_56, () => Accordion.Content, ($$anchor, Accordion_Content_8) => {
												Accordion_Content_8($$anchor, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$anchor, $$slotProps) => {
														{
															let $0 = $.derived(() => $.get(monitor).status || "INACTIVE");

															DangerZoneCard($$anchor, {
																get monitor() {
																	return $.get(monitor);
																},

																get status() {
																	return $.get($0);
																}
															});
														}
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_39);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_38);
							};

							$.if(node_53, ($$render) => {
								if (!$.get(isNew)) $$render(consequent_13);
							});
						}

						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_11);
		};

		$.if(node_12, ($$render) => {
			if ($.get(loading)) $$render(consequent_3); else if ($.get(error)) $$render(consequent_4, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);

	var node_57 = $.sibling(div, 2);

	$.component(node_57, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(cloneDialogOpen);
			},

			set open($$value) {
				$.set(cloneDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_41 = $.comment();
				var node_58 = $.first_child(fragment_41);

				$.component(node_58, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-md',
						children: ($$anchor, $$slotProps) => {
							var fragment_42 = root_10();
							var node_59 = $.first_child(fragment_42);

							$.component(node_59, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_43 = root_5();
										var node_60 = $.first_child(fragment_43);

										$.component(node_60, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Clone Monitor');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										var node_61 = $.sibling(node_60, 2);

										$.component(node_61, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Enter a new tag and name for the cloned monitor.');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_43);
									},
									$$slots: { default: true }
								});
							});

							var div_5 = $.sibling(node_59, 2);
							var div_6 = $.child(div_5);
							var node_62 = $.child(div_6);

							Label(node_62, {
								for: 'clone-tag',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Tag');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_63 = $.sibling(node_62, 2);

							Input(node_63, {
								id: 'clone-tag',
								placeholder: 'my-monitor-copy',
								get value() {
									return $.get(cloneTag);
								},

								set value($$value) {
									$.set(cloneTag, $$value, true);
								}
							});

							$.reset(div_6);

							var div_7 = $.sibling(div_6, 2);
							var node_64 = $.child(div_7);

							Label(node_64, {
								for: 'clone-name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('Name');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							var node_65 = $.sibling(node_64, 2);

							Input(node_65, {
								id: 'clone-name',
								placeholder: 'Monitor Name Copy',
								get value() {
									return $.get(cloneName);
								},

								set value($$value) {
									$.set(cloneName, $$value, true);
								}
							});

							$.reset(div_7);
							$.reset(div_5);

							var node_66 = $.sibling(div_5, 2);

							$.component(node_66, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_44 = root_5();
										var node_67 = $.first_child(fragment_44);

										Button(node_67, {
											variant: 'outline',
											onclick: () => $.set(cloneDialogOpen, false),
											get disabled() {
												return $.get(cloning);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_20 = $.text('Cancel');

												$.append($$anchor, text_20);
											},
											$$slots: { default: true }
										});

										var node_68 = $.sibling(node_67, 2);

										{
											let $0 = $.derived(() => $.get(cloning) || !$.get(cloneTag).trim() || !$.get(cloneName).trim());

											Button(node_68, {
												onclick: cloneMonitor,
												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_45 = $.comment();
													var node_69 = $.first_child(fragment_45);

													{
														var consequent_14 = ($$anchor) => {
															var fragment_46 = root_9();
															var node_70 = $.first_child(fragment_46);

															Spinner(node_70, { class: 'size-4' });
															$.next();
															$.append($$anchor, fragment_46);
														};

														var alternate_2 = ($$anchor) => {
															var text_21 = $.text('Clone');

															$.append($$anchor, text_21);
														};

														$.if(node_69, ($$render) => {
															if ($.get(cloning)) $$render(consequent_14); else $$render(alternate_2, -1);
														});
													}

													$.append($$anchor, fragment_45);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_44);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_42);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_41);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}