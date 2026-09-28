import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const alertConfigId = $.derived(() => data.alert_config_id);
		const isNew = $.derived(() => alertConfigId() === "new");

		// State
		let loading = true;

		let saving = false;
		let triggers = [];
		let monitors = [];
		let deleteDialogOpen = false;
		let monitorPopoverOpen = false;

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

		let form = { ...defaultForm };

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
		const alertValueLabel = $.derived(() => getAlertText({ kind: "label", alert_for: form.alert_for }));

		const alertValueHelp = $.derived(() => getAlertText({ kind: "help", alert_for: form.alert_for }));

		const alertDescriptionText = $.derived(() => getAlertText({
			kind: "description",
			alert_for: form.alert_for,
			alert_value: form.alert_value,
			failure_threshold: Number(form.failure_threshold),
			success_threshold: Number(form.success_threshold)
		}));

		// Handlers
		function handleAlertForChange(newValue) {
			form.alert_for = newValue;

			if (newValue === GC.STATUS) {
				form.alert_value = GC.DOWN;
			} else if (newValue === GC.LATENCY) {
				form.alert_value = "1000";
			} else if (newValue === GC.UPTIME) {
				form.alert_value = "99";
			}
		}

		function toggleMonitor(monitorTag) {
			if (form.monitor_tags.includes(monitorTag)) {
				form.monitor_tags = form.monitor_tags.filter((tag) => tag !== monitorTag);
			} else {
				form.monitor_tags = [...form.monitor_tags, monitorTag];
			}
		}

		function toggleTrigger(triggerId) {
			if (form.trigger_ids.includes(triggerId)) {
				form.trigger_ids = form.trigger_ids.filter((id) => id !== triggerId);
			} else {
				form.trigger_ids = [...form.trigger_ids, triggerId];
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

				triggers = await response.json();
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
					monitors = result.map((m) => ({ tag: m.tag, name: m.name }));
				}
			} catch(error) {
				console.error("Failed to load monitors", error);
			}
		}

		async function loadAlertConfig() {
			if (isNew()) return;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getMonitorAlertConfigById",
						data: { id: parseInt(alertConfigId()) }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
					goto(clientResolver(resolve, "/manage/app/alerts"));
				} else {
					const config = result;

					form = {
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
					};
				}
			} catch(error) {
				console.error("Failed to load alert config", error);
				toast.error("Failed to load alert configuration");
				goto(clientResolver(resolve, "/manage/app/alerts"));
			}
		}

		async function saveAlertConfig() {
			if (form.monitor_tags.length === 0) {
				toast.error("Please select at least one monitor");

				return;
			}

			saving = true;

			try {
				const action = isNew()
					? "createMonitorAlertConfig"
					: "updateMonitorAlertConfig";

				const data = {
					monitor_tags: form.monitor_tags,
					alert_for: form.alert_for,
					alert_value: form.alert_value,
					failure_threshold: form.failure_threshold,
					success_threshold: form.success_threshold,
					alert_description: form.alert_description || null,
					create_incident: form.create_incident,
					severity: form.severity,
					trigger_ids: form.trigger_ids
				};

				if (!isNew()) {
					data.id = parseInt(alertConfigId());
					data.is_active = form.is_active;
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
					toast.success(isNew()
						? "Alert created successfully"
						: "Alert updated successfully");

					if (isNew()) {
						goto(clientResolver(resolve, `/manage/app/alerts/${result.id}`));
					}
				}
			} catch(error) {
				toast.error("Failed to save alert");
			} finally {
				saving = false;
			}
		}

		async function deleteAlertConfig() {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "deleteMonitorAlertConfig",
						data: { id: parseInt(alertConfigId()) }
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
				deleteDialogOpen = false;
			}
		}

		onMount(async () => {
			loading = true;
			await Promise.all([loadTriggers(), loadMonitors(), loadAlertConfig()]);
			loading = false;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container mx-auto space-y-6 py-6">`);

			if (Breadcrumb.Root) {
				$$renderer.push('<!--[-->');

				Breadcrumb.Root($$renderer, {
					children: ($$renderer) => {
						if (Breadcrumb.List) {
							$$renderer.push('<!--[-->');

							Breadcrumb.List($$renderer, {
								children: ($$renderer) => {
									if (Breadcrumb.Item) {
										$$renderer.push('<!--[-->');

										Breadcrumb.Item($$renderer, {
											children: ($$renderer) => {
												if (Breadcrumb.Link) {
													$$renderer.push('<!--[-->');

													Breadcrumb.Link($$renderer, {
														href: clientResolver(resolve, "/manage/app/alerts"),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Alerts`);
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

									if (Breadcrumb.Separator) {
										$$renderer.push('<!--[-->');
										Breadcrumb.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Breadcrumb.Item) {
										$$renderer.push('<!--[-->');

										Breadcrumb.Item($$renderer, {
											children: ($$renderer) => {
												if (Breadcrumb.Page) {
													$$renderer.push('<!--[-->');

													Breadcrumb.Page($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(isNew() ? "New Alert" : `Edit Alert #${alertConfigId()}`)}`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex flex-col items-center gap-4 py-16">`);
				Spinner($$renderer, { class: 'size-8' });
				$$renderer.push(`<!----> <p class="text-muted-foreground">Loading...</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: 'space-y-6 pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Monitors`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Select which monitors this alert applies to</p> `);

										if (Popover.Root) {
											$$renderer.push('<!--[-->');

											Popover.Root($$renderer, {
												get open() {
													return monitorPopoverOpen;
												},

												set open($$value) {
													monitorPopoverOpen = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													if (Popover.Trigger) {
														$$renderer.push('<!--[-->');

														Popover.Trigger($$renderer, {
															children: ($$renderer) => {
																Button($$renderer, {
																	variant: 'outline',
																	role: 'combobox',
																	class: 'w-full justify-between font-normal',
																	children: ($$renderer) => {
																		if (form.monitor_tags.length === 0) {
																			$$renderer.push(`<!--[0-->Select monitors...`);
																		} else if (form.monitor_tags.length === 1) {
																			$$renderer.push(`<!--[1-->${$.escape(monitors.find((m) => m.tag === form.monitor_tags[0])?.name || form.monitor_tags[0])}`);
																		} else {
																			$$renderer.push(`<!--[-1-->${$.escape(form.monitor_tags.length)} monitors selected`);
																		}

																		$$renderer.push(`<!--]--> `);
																		ChevronsUpDownIcon($$renderer, { class: 'text-muted-foreground size-4 shrink-0' });
																		$$renderer.push(`<!---->`);
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

													if (Popover.Content) {
														$$renderer.push('<!--[-->');

														Popover.Content($$renderer, {
															class: 'w-[var(--bits-popover-trigger-width)] p-0',
															align: 'start',
															children: ($$renderer) => {
																if (Command.Root) {
																	$$renderer.push('<!--[-->');

																	Command.Root($$renderer, {
																		children: ($$renderer) => {
																			if (Command.Input) {
																				$$renderer.push('<!--[-->');
																				Command.Input($$renderer, { placeholder: 'Search monitors...' });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Command.List) {
																				$$renderer.push('<!--[-->');

																				Command.List($$renderer, {
																					children: ($$renderer) => {
																						if (Command.Empty) {
																							$$renderer.push('<!--[-->');

																							Command.Empty($$renderer, {
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->No monitors found.`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Command.Group) {
																							$$renderer.push('<!--[-->');

																							Command.Group($$renderer, {
																								children: ($$renderer) => {
																									$$renderer.push(`<!--[-->`);

																									const each_array = $.ensure_array_like(monitors);

																									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																										let monitor = each_array[$$index];

																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												value: monitor.name,
																												onSelect: () => toggleMonitor(monitor.tag),
																												children: ($$renderer) => {
																													CheckIcon($$renderer, {
																														class: `size-4 ${form.monitor_tags.includes(monitor.tag) ? 'opacity-100' : 'opacity-0'}`
																													});

																													$$renderer.push(`<!----> ${$.escape(monitor.name)}`);
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

										if (form.monitor_tags.length > 0) {
											$$renderer.push(`<!--[0--><div class="flex flex-wrap gap-1.5"><!--[-->`);

											const each_array_1 = $.ensure_array_like(form.monitor_tags);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let tag = each_array_1[$$index_1];

												Badge($$renderer, {
													variant: 'secondary',
													class: 'gap-1 pr-1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(monitors.find((m) => m.tag === tag)?.name || tag)} <button type="button" class="hover:bg-muted rounded-sm p-0.5">`);
														XIcon($$renderer, { class: 'size-3' });
														$$renderer.push(`<!----></button>`);
													},
													$$slots: { default: true }
												});
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'alert-for',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Alert Type`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: form.alert_for,
												onValueChange: (v) => v && handleAlertForChange(v),
												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'alert-for',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(alertForOptions.find((o) => o.value === form.alert_for)?.label || "Select type")}`);
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
																$$renderer.push(`<!--[-->`);

																const each_array_2 = $.ensure_array_like(alertForOptions);

																for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																	let option = each_array_2[$$index_2];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: option.value,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(option.label)}`);
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

										$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'alert-value',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(alertValueLabel())}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (form.alert_for === "STATUS") {
											$$renderer.push('<!--[0-->');

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													value: form.alert_value,
													onValueChange: (v) => v && (form.alert_value = v),
													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'alert-value',
																class: 'w-full',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(form.alert_value)}`);
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
																	$$renderer.push(`<!--[-->`);

																	const each_array_3 = $.ensure_array_like(statusValueOptions);

																	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																		let option = each_array_3[$$index_3];

																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: option.value,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(option.label)}`);
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
										} else {
											$$renderer.push('<!--[-1-->');

											Input($$renderer, {
												id: 'alert-value',
												type: 'number',
												min: form.alert_for === GC.UPTIME ? "0" : "1",
												max: form.alert_for === GC.UPTIME ? "100" : undefined,
												get value() {
													return form.alert_value;
												},

												set value($$value) {
													form.alert_value = $$value;
													$$settled = false;
												}
											});
										}

										$$renderer.push(`<!--]--> <p class="text-muted-foreground text-xs">${$.escape(alertValueHelp())}</p></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'failure-threshold',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Failure Threshold`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'failure-threshold',
											type: 'number',
											min: '1',
											get value() {
												return form.failure_threshold;
											},

											set value($$value) {
												form.failure_threshold = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Consecutive failures before alert</p></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'success-threshold',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Success Threshold`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'success-threshold',
											type: 'number',
											min: '1',
											get value() {
												return form.success_threshold;
											},

											set value($$value) {
												form.success_threshold = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Consecutive successes to resolve</p></div></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Details`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground bg-muted/40 rounded-md border p-3 text-sm">${$.escape(alertDescriptionText())}</p></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'severity',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Severity`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: form.severity,
												onValueChange: (v) => v && (form.severity = v),
												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'severity',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(severityOptions.find((o) => o.value === form.severity)?.label || "Select severity")}`);
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
																$$renderer.push(`<!--[-->`);

																const each_array_4 = $.ensure_array_like(severityOptions);

																for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																	let option = each_array_4[$$index_4];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: option.value,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(option.label)}`);
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

										$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'create-incident',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create Incident`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: form.create_incident,
												onValueChange: (v) => v && (form.create_incident = v),
												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'create-incident',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(form.create_incident)}`);
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
																$$renderer.push(`<!--[-->`);

																const each_array_5 = $.ensure_array_like(yesNoOptions);

																for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
																	let option = each_array_5[$$index_5];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: option.value,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(option.label)}`);
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

										$$renderer.push(` <p class="text-muted-foreground text-xs">Automatically create an incident when this alert triggers</p></div> `);

										if (!isNew()) {
											$$renderer.push(`<!--[0--><div class="flex items-center justify-between"><div>`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Active`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Enable or disable this alert</p></div> `);

											Switch($$renderer, {
												checked: form.is_active === GC.YES,
												onCheckedChange: (checked) => form.is_active = checked ? GC.YES : GC.NO
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'alert-description',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Description (optional)`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Textarea($$renderer, {
											id: 'alert-description',
											placeholder: 'Add a description for this alert...',
											rows: 2,
											get value() {
												return form.alert_description;
											},

											set value($$value) {
												form.alert_description = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> `);

										if (triggers.length > 0) {
											$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Notification Triggers`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Select which triggers to notify when this alert fires</p> <div class="mt-2 grid gap-2"><!--[-->`);

											const each_array_6 = $.ensure_array_like(triggers);

											for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
												let trigger = each_array_6[$$index_6];

												$$renderer.push(`<label class="bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-md border p-3">`);

												Checkbox($$renderer, {
													checked: form.trigger_ids.includes(trigger.id),
													onCheckedChange: () => toggleTrigger(trigger.id)
												});

												$$renderer.push(`<!----> <div class="flex-1"><p class="text-sm font-medium">${$.escape(trigger.name)}</p> `);

												if (trigger.trigger_desc) {
													$$renderer.push(`<!--[0--><p class="text-muted-foreground text-xs">${$.escape(trigger.trigger_desc)}</p>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></div> `);

												Badge($$renderer, {
													variant: 'outline',
													class: 'text-xs capitalize',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(trigger.trigger_type)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----></label>`);
											}

											$$renderer.push(`<!--]--></div></div>`);
										} else {
											$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-sm">No notification triggers available. <a${$.attr('href', clientResolver(resolve, "/manage/app/triggers"))} class="text-primary underline">Create a trigger</a> to receive notifications.</p>`);
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

							if (Card.Footer) {
								$$renderer.push('<!--[-->');

								Card.Footer($$renderer, {
									class: 'flex justify-between',
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											onclick: () => goto(clientResolver(resolve, "/manage/app/alerts")),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancel`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											onclick: saveAlertConfig,
											disabled: saving,
											children: ($$renderer) => {
												if (saving) {
													$$renderer.push('<!--[0-->');
													Spinner($$renderer, { class: 'size-4' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> ${$.escape(isNew() ? "Create Alert" : "Save Changes")}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
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

				if (!isNew()) {
					$$renderer.push('<!--[0-->');

					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							class: 'border-destructive',
							children: ($$renderer) => {
								if (Card.Header) {
									$$renderer.push('<!--[-->');

									Card.Header($$renderer, {
										children: ($$renderer) => {
											if (Card.Title) {
												$$renderer.push('<!--[-->');

												Card.Title($$renderer, {
													class: 'text-destructive',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Danger Zone`);
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
														$$renderer.push(`<!---->Irreversible actions for this alert configuration.`);
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

								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'destructive',
												onclick: () => deleteDialogOpen = true,
												children: ($$renderer) => {
													TrashIcon($$renderer, { class: 'size-4' });
													$$renderer.push(`<!----> Delete Alert`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return deleteDialogOpen;
					},

					set open($$value) {
						deleteDialogOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete Alert`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure you want to delete this alert? This action cannot be undone.`);
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

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: deleteAlertConfig,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete`);
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