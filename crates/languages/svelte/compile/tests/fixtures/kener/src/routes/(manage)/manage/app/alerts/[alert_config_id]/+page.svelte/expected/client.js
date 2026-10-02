import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/stores";
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as Command from "$lib/components/ui/command/index.js";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import TrashIcon from "@lucide/svelte/icons/trash";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import CheckIcon from "@lucide/svelte/icons/check";
import XIcon from "@lucide/svelte/icons/x";
import GC from "$lib/global-constants";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { getAlertText } from "$lib/alerts/alert-text";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-4 py-16"><!> <p class="text-muted-foreground">Loading...</p></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> `, 1);
var root_4 = $.from_html(` <button type="button" class="hover:bg-muted rounded-sm p-0.5"><!></button>`, 1);
var root_5 = $.from_html(`<div class="flex flex-wrap gap-1.5"></div>`);
var root_6 = $.from_html(`<div class="flex items-center justify-between"><div><!> <p class="text-muted-foreground text-xs">Enable or disable this alert</p></div> <!></div>`);
var root_7 = $.from_html(`<p class="text-muted-foreground text-xs"> </p>`);
var root_8 = $.from_html(`<label class="bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-md border p-3"><!> <div class="flex-1"><p class="text-sm font-medium"> </p> <!></div> <!></label>`);
var root_9 = $.from_html(`<div class="flex flex-col gap-2"><!> <p class="text-muted-foreground text-xs">Select which triggers to notify when this alert fires</p> <div class="mt-2 grid gap-2"></div></div>`);
var root_10 = $.from_html(`<p class="text-muted-foreground text-sm">No notification triggers available. <a class="text-primary underline">Create a trigger</a> to receive notifications.</p>`);
var root_11 = $.from_html(`<div class="flex flex-col gap-2"><!> <p class="text-muted-foreground text-xs">Select which monitors this alert applies to</p> <!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs"> </p></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Consecutive failures before alert</p></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Consecutive successes to resolve</p></div></div> <div class="flex flex-col gap-2"><!> <p class="text-muted-foreground bg-muted/40 rounded-md border p-3 text-sm"> </p></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Automatically create an incident when this alert triggers</p></div> <!> <div class="flex flex-col gap-2"><!> <!></div> <!>`, 1);
var root_12 = $.from_html(`<!> Delete Alert`, 1);
var root_13 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><!> <!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const alertConfigId = $.derived(() => $$props.data.alert_config_id);
	const isNew = $.derived(() => $.get(alertConfigId) === "new");

	// State
	let loading = $.state(true);

	let saving = $.state(false);
	let triggers = $.state($.proxy([]));
	let monitors = $.state($.proxy([]));
	let deleteDialogOpen = $.state(false);
	let monitorPopoverOpen = $.state(false);

	// Form state
	const defaultForm = {
		monitor_tags: [],
		alert_for: "STATUS",
		alert_value: "DOWN",
		failure_threshold: 3,
		success_threshold: 1,
		alert_description: "",
		create_incident: "NO",
		is_active: "YES",
		severity: "WARNING",
		trigger_ids: []
	};

	let form = $.state($.proxy({ ...defaultForm }));

	// Options
	const alertForOptions = [
		{ value: GC.STATUS, label: GC.STATUS },
		{ value: GC.LATENCY, label: GC.LATENCY },
		{ value: GC.UPTIME, label: GC.UPTIME }
	];

	const statusValueOptions = [
		{ value: GC.DOWN, label: GC.DOWN },
		{ value: GC.DEGRADED, label: GC.DEGRADED }
	];

	const severityOptions = [
		{ value: GC.CRITICAL, label: GC.CRITICAL },
		{ value: GC.WARNING, label: GC.WARNING }
	];

	const yesNoOptions = [
		{ value: GC.YES, label: GC.YES },
		{ value: GC.NO, label: GC.NO }
	];

	// Computed labels
	const alertValueLabel = $.derived(() => getAlertText({ kind: "label", alert_for: $.get(form).alert_for }));

	const alertValueHelp = $.derived(() => getAlertText({ kind: "help", alert_for: $.get(form).alert_for }));

	const alertDescriptionText = $.derived(() => getAlertText({
		kind: "description",
		alert_for: $.get(form).alert_for,
		alert_value: $.get(form).alert_value,
		failure_threshold: Number($.get(form).failure_threshold),
		success_threshold: Number($.get(form).success_threshold)
	}));

	// Handlers
	function handleAlertForChange(newValue) {
		$.get(form).alert_for = newValue;

		if (newValue === GC.STATUS) {
			$.get(form).alert_value = GC.DOWN;
		} else if (newValue === GC.LATENCY) {
			$.get(form).alert_value = "1000";
		} else if (newValue === GC.UPTIME) {
			$.get(form).alert_value = "99";
		}
	}

	function toggleMonitor(monitorTag) {
		if ($.get(form).monitor_tags.includes(monitorTag)) {
			$.get(form).monitor_tags = $.get(form).monitor_tags.filter((tag) => tag !== monitorTag);
		} else {
			$.get(form).monitor_tags = [...$.get(form).monitor_tags, monitorTag];
		}
	}

	function toggleTrigger(triggerId) {
		if ($.get(form).trigger_ids.includes(triggerId)) {
			$.get(form).trigger_ids = $.get(form).trigger_ids.filter((id) => id !== triggerId);
		} else {
			$.get(form).trigger_ids = [...$.get(form).trigger_ids, triggerId];
		}
	}

	// API calls
	async function loadTriggers() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getTriggers", data: { status: GC.ACTIVE } })
			});

			$.set(triggers, await response.json(), true);
		} catch(error) {
			console.error("Failed to load triggers", error);
		}
	}

	async function loadMonitors() {
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
			console.error("Failed to load monitors", error);
		}
	}

	async function loadAlertConfig() {
		if ($.get(isNew)) return;

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

			if (result.error) {
				toast.error(result.error);
				goto(clientResolver(resolve, "/manage/app/alerts"));
			} else {
				const config = result;

				$.set(
					form,
					{
						monitor_tags: config.monitor_tags || [],
						alert_for: config.alert_for,
						alert_value: config.alert_value,
						failure_threshold: config.failure_threshold,
						success_threshold: config.success_threshold,
						alert_description: config.alert_description || "",
						create_incident: config.create_incident,
						is_active: config.is_active,
						severity: config.severity,
						trigger_ids: config.triggers.map((t) => t.id)
					},
					true
				);
			}
		} catch(error) {
			console.error("Failed to load alert config", error);
			toast.error("Failed to load alert configuration");
			goto(clientResolver(resolve, "/manage/app/alerts"));
		}
	}

	async function saveAlertConfig() {
		if ($.get(form).monitor_tags.length === 0) {
			toast.error("Please select at least one monitor");

			return;
		}

		$.set(saving, true);

		try {
			const action = $.get(isNew)
				? "createMonitorAlertConfig"
				: "updateMonitorAlertConfig";

			const data = {
				monitor_tags: $.get(form).monitor_tags,
				alert_for: $.get(form).alert_for,
				alert_value: $.get(form).alert_value,
				failure_threshold: $.get(form).failure_threshold,
				success_threshold: $.get(form).success_threshold,
				alert_description: $.get(form).alert_description || null,
				create_incident: $.get(form).create_incident,
				severity: $.get(form).severity,
				trigger_ids: $.get(form).trigger_ids
			};

			if (!$.get(isNew)) {
				data.id = parseInt($.get(alertConfigId));
				data.is_active = $.get(form).is_active;
			}

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action, data })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success($.get(isNew)
					? "Alert created successfully"
					: "Alert updated successfully");

				if ($.get(isNew)) {
					goto(clientResolver(resolve, `/manage/app/alerts/${result.id}`));
				}
			}
		} catch(error) {
			toast.error("Failed to save alert");
		} finally {
			$.set(saving, false);
		}
	}

	async function deleteAlertConfig() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "deleteMonitorAlertConfig",
					data: { id: parseInt($.get(alertConfigId)) }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Alert deleted successfully");
				goto(clientResolver(resolve, "/manage/app/alerts"));
			}
		} catch(error) {
			toast.error("Failed to delete alert");
		} finally {
			$.set(deleteDialogOpen, false);
		}
	}

	onMount(async () => {
		$.set(loading, true);
		await Promise.all([loadTriggers(), loadMonitors(), loadAlertConfig()]);
		$.set(loading, false);
	});

	var fragment = root_13();
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

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(isNew) ? "New Alert" : `Edit Alert #${$.get(alertConfigId)}`));
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

	var node_7 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var node_8 = $.child(div_1);

			Spinner(node_8, { class: 'size-8' });
			$.next(2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_3 = ($$anchor) => {
			var fragment_6 = root_2();
			var node_9 = $.first_child(fragment_6);

			$.component(node_9, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_2();
						var node_10 = $.first_child(fragment_7);

						$.component(node_10, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'space-y-6 pt-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_11();
									var div_2 = $.first_child(fragment_8);
									var node_11 = $.child(div_2);

									Label(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Monitors');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 4);

									$.component(node_12, () => Popover.Root, ($$anchor, Popover_Root) => {
										Popover_Root($$anchor, {
											get open() {
												return $.get(monitorPopoverOpen);
											},

											set open($$value) {
												$.set(monitorPopoverOpen, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_2();
												var node_13 = $.first_child(fragment_9);

												$.component(node_13, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
													Popover_Trigger($$anchor, {
														children: ($$anchor, $$slotProps) => {
															Button($$anchor, {
																variant: 'outline',
																role: 'combobox',
																class: 'w-full justify-between font-normal',
																children: ($$anchor, $$slotProps) => {
																	var fragment_11 = root_2();
																	var node_14 = $.first_child(fragment_11);

																	{
																		var consequent_1 = ($$anchor) => {
																			var text_3 = $.text('Select monitors...');

																			$.append($$anchor, text_3);
																		};

																		var consequent_2 = ($$anchor) => {
																			var text_4 = $.text();

																			$.template_effect(($0) => $.set_text(text_4, $0), [
																				() => $.get(monitors).find((m) => m.tag === $.get(form).monitor_tags[0])?.name || $.get(form).monitor_tags[0]
																			]);

																			$.append($$anchor, text_4);
																		};

																		var alternate = ($$anchor) => {
																			var text_5 = $.text();

																			$.template_effect(() => $.set_text(text_5, `${$.get(form).monitor_tags.length ?? ''} monitors selected`));
																			$.append($$anchor, text_5);
																		};

																		$.if(node_14, ($$render) => {
																			if ($.get(form).monitor_tags.length === 0) $$render(consequent_1); else if ($.get(form).monitor_tags.length === 1) $$render(consequent_2, 1); else $$render(alternate, -1);
																		});
																	}

																	var node_15 = $.sibling(node_14, 2);

																	ChevronsUpDownIcon(node_15, { class: 'text-muted-foreground size-4 shrink-0' });
																	$.append($$anchor, fragment_11);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_13, 2);

												$.component(node_16, () => Popover.Content, ($$anchor, Popover_Content) => {
													Popover_Content($$anchor, {
														class: 'w-[var(--bits-popover-trigger-width)] p-0',
														align: 'start',
														children: ($$anchor, $$slotProps) => {
															var fragment_14 = $.comment();
															var node_17 = $.first_child(fragment_14);

															$.component(node_17, () => Command.Root, ($$anchor, Command_Root) => {
																Command_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_15 = root_2();
																		var node_18 = $.first_child(fragment_15);

																		$.component(node_18, () => Command.Input, ($$anchor, Command_Input) => {
																			Command_Input($$anchor, { placeholder: 'Search monitors...' });
																		});

																		var node_19 = $.sibling(node_18, 2);

																		$.component(node_19, () => Command.List, ($$anchor, Command_List) => {
																			Command_List($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_16 = root_2();
																					var node_20 = $.first_child(fragment_16);

																					$.component(node_20, () => Command.Empty, ($$anchor, Command_Empty) => {
																						Command_Empty($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('No monitors found.');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_21 = $.sibling(node_20, 2);

																					$.component(node_21, () => Command.Group, ($$anchor, Command_Group) => {
																						Command_Group($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_17 = $.comment();
																								var node_22 = $.first_child(fragment_17);

																								$.each(node_22, 17, () => $.get(monitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
																									var fragment_18 = $.comment();
																									var node_23 = $.first_child(fragment_18);

																									$.component(node_23, () => Command.Item, ($$anchor, Command_Item) => {
																										Command_Item($$anchor, {
																											get value() {
																												return $.get(monitor).name;
																											},
																											onSelect: () => toggleMonitor($.get(monitor).tag),
																											children: ($$anchor, $$slotProps) => {
																												var fragment_19 = root_3();
																												var node_24 = $.first_child(fragment_19);

																												{
																													let $0 = $.derived(() => $.get(form).monitor_tags.includes($.get(monitor).tag) ? 'opacity-100' : 'opacity-0');

																													CheckIcon(node_24, {
																														get class() {
																															return `size-4 ${$.get($0) ?? ''}`;
																														}
																													});
																												}

																												var text_7 = $.sibling(node_24);

																												$.template_effect(() => $.set_text(text_7, ` ${$.get(monitor).name ?? ''}`));
																												$.append($$anchor, fragment_19);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_18);
																								});

																								$.append($$anchor, fragment_17);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_16);
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
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var node_25 = $.sibling(node_12, 2);

									{
										var consequent_3 = ($$anchor) => {
											var div_3 = root_5();

											$.each(div_3, 20, () => $.get(form).monitor_tags, (tag) => tag, ($$anchor, tag) => {
												Badge($$anchor, {
													variant: 'secondary',
													class: 'gap-1 pr-1',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_21 = root_4();
														var text_8 = $.first_child(fragment_21);
														var button = $.sibling(text_8);
														var node_26 = $.child(button);

														XIcon(node_26, { class: 'size-3' });
														$.reset(button);

														$.template_effect(($0) => $.set_text(text_8, `${$0 ?? ''} `), [
															() => $.get(monitors).find((m) => m.tag === tag)?.name || tag
														]);

														$.delegated('click', button, () => toggleMonitor(tag));
														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_3);
											$.append($$anchor, div_3);
										};

										$.if(node_25, ($$render) => {
											if ($.get(form).monitor_tags.length > 0) $$render(consequent_3);
										});
									}

									$.reset(div_2);

									var div_4 = $.sibling(div_2, 2);
									var node_27 = $.child(div_4);

									Label(node_27, {
										for: 'alert-for',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Alert Type');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									var node_28 = $.sibling(node_27, 2);

									$.component(node_28, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(form).alert_for;
											},
											onValueChange: (v) => v && handleAlertForChange(v),
											children: ($$anchor, $$slotProps) => {
												var fragment_22 = root_2();
												var node_29 = $.first_child(fragment_22);

												$.component(node_29, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														id: 'alert-for',
														class: 'w-full',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text();

															$.template_effect(($0) => $.set_text(text_10, $0), [
																() => alertForOptions.find((o) => o.value === $.get(form).alert_for)?.label || "Select type"
															]);

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_30 = $.sibling(node_29, 2);

												$.component(node_30, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_24 = $.comment();
															var node_31 = $.first_child(fragment_24);

															$.each(node_31, 17, () => alertForOptions, $.index, ($$anchor, option) => {
																var fragment_25 = $.comment();
																var node_32 = $.first_child(fragment_25);

																$.component(node_32, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		get value() {
																			return $.get(option).value;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text();

																			$.template_effect(() => $.set_text(text_11, $.get(option).label));
																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_25);
															});

															$.append($$anchor, fragment_24);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_4);

									var div_5 = $.sibling(div_4, 2);
									var node_33 = $.child(div_5);

									Label(node_33, {
										for: 'alert-value',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text();

											$.template_effect(() => $.set_text(text_12, $.get(alertValueLabel)));
											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									var node_34 = $.sibling(node_33, 2);

									{
										var consequent_4 = ($$anchor) => {
											var fragment_28 = $.comment();
											var node_35 = $.first_child(fragment_28);

											$.component(node_35, () => Select.Root, ($$anchor, Select_Root_1) => {
												Select_Root_1($$anchor, {
													type: 'single',
													get value() {
														return $.get(form).alert_value;
													},
													onValueChange: (v) => v && ($.get(form).alert_value = v),
													children: ($$anchor, $$slotProps) => {
														var fragment_29 = root_2();
														var node_36 = $.first_child(fragment_29);

														$.component(node_36, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
															Select_Trigger_1($$anchor, {
																id: 'alert-value',
																class: 'w-full',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_13 = $.text();

																	$.template_effect(() => $.set_text(text_13, $.get(form).alert_value));
																	$.append($$anchor, text_13);
																},
																$$slots: { default: true }
															});
														});

														var node_37 = $.sibling(node_36, 2);

														$.component(node_37, () => Select.Content, ($$anchor, Select_Content_1) => {
															Select_Content_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_31 = $.comment();
																	var node_38 = $.first_child(fragment_31);

																	$.each(node_38, 17, () => statusValueOptions, $.index, ($$anchor, option) => {
																		var fragment_32 = $.comment();
																		var node_39 = $.first_child(fragment_32);

																		$.component(node_39, () => Select.Item, ($$anchor, Select_Item_1) => {
																			Select_Item_1($$anchor, {
																				get value() {
																					return $.get(option).value;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_14 = $.text();

																					$.template_effect(() => $.set_text(text_14, $.get(option).label));
																					$.append($$anchor, text_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_32);
																	});

																	$.append($$anchor, fragment_31);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_29);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_28);
										};

										var alternate_1 = ($$anchor) => {
											{
												let $0 = $.derived(() => $.get(form).alert_for === GC.UPTIME ? "0" : "1");
												let $1 = $.derived(() => $.get(form).alert_for === GC.UPTIME ? "100" : undefined);

												Input($$anchor, {
													id: 'alert-value',
													type: 'number',
													get min() {
														return $.get($0);
													},

													get max() {
														return $.get($1);
													},

													get value() {
														return $.get(form).alert_value;
													},

													set value($$value) {
														$.get(form).alert_value = $$value;
													}
												});
											}
										};

										$.if(node_34, ($$render) => {
											if ($.get(form).alert_for === "STATUS") $$render(consequent_4); else $$render(alternate_1, -1);
										});
									}

									var p = $.sibling(node_34, 2);
									var text_15 = $.only_child(p, true);

									$.reset(div_5);

									var div_6 = $.sibling(div_5, 2);
									var div_7 = $.child(div_6);
									var node_40 = $.child(div_7);

									Label(node_40, {
										for: 'failure-threshold',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Failure Threshold');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									var node_41 = $.sibling(node_40, 2);

									Input(node_41, {
										id: 'failure-threshold',
										type: 'number',
										min: '1',
										get value() {
											return $.get(form).failure_threshold;
										},

										set value($$value) {
											$.get(form).failure_threshold = $$value;
										}
									});

									$.next(2);
									$.reset(div_7);

									var div_8 = $.sibling(div_7, 2);
									var node_42 = $.child(div_8);

									Label(node_42, {
										for: 'success-threshold',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_17 = $.text('Success Threshold');

											$.append($$anchor, text_17);
										},
										$$slots: { default: true }
									});

									var node_43 = $.sibling(node_42, 2);

									Input(node_43, {
										id: 'success-threshold',
										type: 'number',
										min: '1',
										get value() {
											return $.get(form).success_threshold;
										},

										set value($$value) {
											$.get(form).success_threshold = $$value;
										}
									});

									$.next(2);
									$.reset(div_8);
									$.reset(div_6);

									var div_9 = $.sibling(div_6, 2);
									var node_44 = $.child(div_9);

									Label(node_44, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_18 = $.text('Details');

											$.append($$anchor, text_18);
										},
										$$slots: { default: true }
									});

									var p_1 = $.sibling(node_44, 2);
									var text_19 = $.only_child(p_1, true);

									$.reset(div_9);

									var div_10 = $.sibling(div_9, 2);
									var node_45 = $.child(div_10);

									Label(node_45, {
										for: 'severity',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_20 = $.text('Severity');

											$.append($$anchor, text_20);
										},
										$$slots: { default: true }
									});

									var node_46 = $.sibling(node_45, 2);

									$.component(node_46, () => Select.Root, ($$anchor, Select_Root_2) => {
										Select_Root_2($$anchor, {
											type: 'single',
											get value() {
												return $.get(form).severity;
											},
											onValueChange: (v) => v && ($.get(form).severity = v),
											children: ($$anchor, $$slotProps) => {
												var fragment_35 = root_2();
												var node_47 = $.first_child(fragment_35);

												$.component(node_47, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
													Select_Trigger_2($$anchor, {
														id: 'severity',
														class: 'w-full',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_21 = $.text();

															$.template_effect(($0) => $.set_text(text_21, $0), [
																() => severityOptions.find((o) => o.value === $.get(form).severity)?.label || "Select severity"
															]);

															$.append($$anchor, text_21);
														},
														$$slots: { default: true }
													});
												});

												var node_48 = $.sibling(node_47, 2);

												$.component(node_48, () => Select.Content, ($$anchor, Select_Content_2) => {
													Select_Content_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_37 = $.comment();
															var node_49 = $.first_child(fragment_37);

															$.each(node_49, 17, () => severityOptions, $.index, ($$anchor, option) => {
																var fragment_38 = $.comment();
																var node_50 = $.first_child(fragment_38);

																$.component(node_50, () => Select.Item, ($$anchor, Select_Item_2) => {
																	Select_Item_2($$anchor, {
																		get value() {
																			return $.get(option).value;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_22 = $.text();

																			$.template_effect(() => $.set_text(text_22, $.get(option).label));
																			$.append($$anchor, text_22);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_38);
															});

															$.append($$anchor, fragment_37);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_35);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_10);

									var div_11 = $.sibling(div_10, 2);
									var node_51 = $.child(div_11);

									Label(node_51, {
										for: 'create-incident',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_23 = $.text('Create Incident');

											$.append($$anchor, text_23);
										},
										$$slots: { default: true }
									});

									var node_52 = $.sibling(node_51, 2);

									$.component(node_52, () => Select.Root, ($$anchor, Select_Root_3) => {
										Select_Root_3($$anchor, {
											type: 'single',
											get value() {
												return $.get(form).create_incident;
											},
											onValueChange: (v) => v && ($.get(form).create_incident = v),
											children: ($$anchor, $$slotProps) => {
												var fragment_40 = root_2();
												var node_53 = $.first_child(fragment_40);

												$.component(node_53, () => Select.Trigger, ($$anchor, Select_Trigger_3) => {
													Select_Trigger_3($$anchor, {
														id: 'create-incident',
														class: 'w-full',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_24 = $.text();

															$.template_effect(() => $.set_text(text_24, $.get(form).create_incident));
															$.append($$anchor, text_24);
														},
														$$slots: { default: true }
													});
												});

												var node_54 = $.sibling(node_53, 2);

												$.component(node_54, () => Select.Content, ($$anchor, Select_Content_3) => {
													Select_Content_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_42 = $.comment();
															var node_55 = $.first_child(fragment_42);

															$.each(node_55, 17, () => yesNoOptions, $.index, ($$anchor, option) => {
																var fragment_43 = $.comment();
																var node_56 = $.first_child(fragment_43);

																$.component(node_56, () => Select.Item, ($$anchor, Select_Item_3) => {
																	Select_Item_3($$anchor, {
																		get value() {
																			return $.get(option).value;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_25 = $.text();

																			$.template_effect(() => $.set_text(text_25, $.get(option).label));
																			$.append($$anchor, text_25);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_43);
															});

															$.append($$anchor, fragment_42);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_40);
											},
											$$slots: { default: true }
										});
									});

									$.next(2);
									$.reset(div_11);

									var node_57 = $.sibling(div_11, 2);

									{
										var consequent_5 = ($$anchor) => {
											var div_12 = root_6();
											var div_13 = $.child(div_12);
											var node_58 = $.child(div_13);

											Label(node_58, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_26 = $.text('Active');

													$.append($$anchor, text_26);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_13);

											var node_59 = $.sibling(div_13, 2);

											{
												let $0 = $.derived(() => $.get(form).is_active === GC.YES);

												Switch(node_59, {
													get checked() {
														return $.get($0);
													},
													onCheckedChange: (checked) => $.get(form).is_active = checked ? GC.YES : GC.NO
												});
											}

											$.reset(div_12);
											$.append($$anchor, div_12);
										};

										$.if(node_57, ($$render) => {
											if (!$.get(isNew)) $$render(consequent_5);
										});
									}

									var div_14 = $.sibling(node_57, 2);
									var node_60 = $.child(div_14);

									Label(node_60, {
										for: 'alert-description',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_27 = $.text('Description (optional)');

											$.append($$anchor, text_27);
										},
										$$slots: { default: true }
									});

									var node_61 = $.sibling(node_60, 2);

									Textarea(node_61, {
										id: 'alert-description',
										placeholder: 'Add a description for this alert...',
										rows: 2,
										get value() {
											return $.get(form).alert_description;
										},

										set value($$value) {
											$.get(form).alert_description = $$value;
										}
									});

									$.reset(div_14);

									var node_62 = $.sibling(div_14, 2);

									{
										var consequent_7 = ($$anchor) => {
											var div_15 = root_9();
											var node_63 = $.child(div_15);

											Label(node_63, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_28 = $.text('Notification Triggers');

													$.append($$anchor, text_28);
												},
												$$slots: { default: true }
											});

											var div_16 = $.sibling(node_63, 4);

											$.each(div_16, 21, () => $.get(triggers), (trigger) => trigger.id, ($$anchor, trigger) => {
												var label = root_8();
												var node_64 = $.child(label);

												{
													let $0 = $.derived(() => $.get(form).trigger_ids.includes($.get(trigger).id));

													Checkbox(node_64, {
														get checked() {
															return $.get($0);
														},
														onCheckedChange: () => toggleTrigger($.get(trigger).id)
													});
												}

												var div_17 = $.sibling(node_64, 2);
												var p_2 = $.child(div_17);
												var text_29 = $.only_child(p_2, true);
												var node_65 = $.sibling(p_2, 2);

												{
													var consequent_6 = ($$anchor) => {
														var p_3 = root_7();
														var text_30 = $.only_child(p_3, true);

														$.template_effect(() => $.set_text(text_30, $.get(trigger).trigger_desc));
														$.append($$anchor, p_3);
													};

													$.if(node_65, ($$render) => {
														if ($.get(trigger).trigger_desc) $$render(consequent_6);
													});
												}

												$.reset(div_17);

												var node_66 = $.sibling(div_17, 2);

												Badge(node_66, {
													variant: 'outline',
													class: 'text-xs capitalize',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_31 = $.text();

														$.template_effect(() => $.set_text(text_31, $.get(trigger).trigger_type));
														$.append($$anchor, text_31);
													},
													$$slots: { default: true }
												});

												$.reset(label);
												$.template_effect(() => $.set_text(text_29, $.get(trigger).name));
												$.append($$anchor, label);
											});

											$.reset(div_16);
											$.reset(div_15);
											$.append($$anchor, div_15);
										};

										var alternate_2 = ($$anchor) => {
											var p_4 = root_10();
											var a = $.sibling($.child(p_4));

											$.next();
											$.reset(p_4);
											$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => clientResolver(resolve, "/manage/app/triggers")]);
											$.append($$anchor, p_4);
										};

										$.if(node_62, ($$render) => {
											if ($.get(triggers).length > 0) $$render(consequent_7); else $$render(alternate_2, -1);
										});
									}

									$.template_effect(() => {
										$.set_text(text_15, $.get(alertValueHelp));
										$.set_text(text_19, $.get(alertDescriptionText));
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_67 = $.sibling(node_10, 2);

						$.component(node_67, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-between',
								children: ($$anchor, $$slotProps) => {
									var fragment_46 = root_2();
									var node_68 = $.first_child(fragment_46);

									Button(node_68, {
										variant: 'outline',
										onclick: () => goto(clientResolver(resolve, "/manage/app/alerts")),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_32 = $.text('Cancel');

											$.append($$anchor, text_32);
										},
										$$slots: { default: true }
									});

									var node_69 = $.sibling(node_68, 2);

									Button(node_69, {
										onclick: saveAlertConfig,
										get disabled() {
											return $.get(saving);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_47 = root_3();
											var node_70 = $.first_child(fragment_47);

											{
												var consequent_8 = ($$anchor) => {
													Spinner($$anchor, { class: 'size-4' });
												};

												$.if(node_70, ($$render) => {
													if ($.get(saving)) $$render(consequent_8);
												});
											}

											var text_33 = $.sibling(node_70);

											$.template_effect(() => $.set_text(text_33, ` ${$.get(isNew) ? "Create Alert" : "Save Changes"}`));
											$.append($$anchor, fragment_47);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_46);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_71 = $.sibling(node_9, 2);

			{
				var consequent_9 = ($$anchor) => {
					var fragment_49 = $.comment();
					var node_72 = $.first_child(fragment_49);

					$.component(node_72, () => Card.Root, ($$anchor, Card_Root_1) => {
						Card_Root_1($$anchor, {
							class: 'border-destructive',
							children: ($$anchor, $$slotProps) => {
								var fragment_50 = root_2();
								var node_73 = $.first_child(fragment_50);

								$.component(node_73, () => Card.Header, ($$anchor, Card_Header) => {
									Card_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_51 = root_2();
											var node_74 = $.first_child(fragment_51);

											$.component(node_74, () => Card.Title, ($$anchor, Card_Title) => {
												Card_Title($$anchor, {
													class: 'text-destructive',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_34 = $.text('Danger Zone');

														$.append($$anchor, text_34);
													},
													$$slots: { default: true }
												});
											});

											var node_75 = $.sibling(node_74, 2);

											$.component(node_75, () => Card.Description, ($$anchor, Card_Description) => {
												Card_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_35 = $.text('Irreversible actions for this alert configuration.');

														$.append($$anchor, text_35);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_51);
										},
										$$slots: { default: true }
									});
								});

								var node_76 = $.sibling(node_73, 2);

								$.component(node_76, () => Card.Content, ($$anchor, Card_Content_1) => {
									Card_Content_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												variant: 'destructive',
												onclick: () => $.set(deleteDialogOpen, true),
												children: ($$anchor, $$slotProps) => {
													var fragment_53 = root_12();
													var node_77 = $.first_child(fragment_53);

													TrashIcon(node_77, { class: 'size-4' });
													$.next();
													$.append($$anchor, fragment_53);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_50);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_49);
				};

				$.if(node_71, ($$render) => {
					if (!$.get(isNew)) $$render(consequent_9);
				});
			}

			$.append($$anchor, fragment_6);
		};

		$.if(node_7, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate_3, -1);
		});
	}

	$.reset(div);

	var node_78 = $.sibling(div, 2);

	$.component(node_78, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(deleteDialogOpen);
			},

			set open($$value) {
				$.set(deleteDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_54 = $.comment();
				var node_79 = $.first_child(fragment_54);

				$.component(node_79, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_55 = root_2();
							var node_80 = $.first_child(fragment_55);

							$.component(node_80, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_56 = root_2();
										var node_81 = $.first_child(fragment_56);

										$.component(node_81, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_36 = $.text('Delete Alert');

													$.append($$anchor, text_36);
												},
												$$slots: { default: true }
											});
										});

										var node_82 = $.sibling(node_81, 2);

										$.component(node_82, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_37 = $.text('Are you sure you want to delete this alert? This action cannot be undone.');

													$.append($$anchor, text_37);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_56);
									},
									$$slots: { default: true }
								});
							});

							var node_83 = $.sibling(node_80, 2);

							$.component(node_83, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_57 = root_2();
										var node_84 = $.first_child(fragment_57);

										$.component(node_84, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_38 = $.text('Cancel');

													$.append($$anchor, text_38);
												},
												$$slots: { default: true }
											});
										});

										var node_85 = $.sibling(node_84, 2);

										$.component(node_85, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: deleteAlertConfig,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_39 = $.text('Delete');

													$.append($$anchor, text_39);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_57);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_55);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_54);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);