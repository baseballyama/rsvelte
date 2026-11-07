import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import CopyButton from "$lib/components/CopyButton.svelte";
import CopyIcon from "@lucide/svelte/icons/copy";
import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { mode } from "mode-watcher";

var root = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div>`);
var root_4 = $.from_html(`<label class="flex items-center gap-2"><!> <span class="text-sm"> </span></label>`);
var root_5 = $.from_html(`<button class="text-muted-foreground self-start text-xs underline hover:no-underline">Clear selection</button>`);
var root_6 = $.from_html(`<div class="flex flex-col gap-2"><!> <div class="flex flex-col gap-2"><label class="flex items-center gap-2"><!> <span class="text-sm">Incidents</span></label> <label class="flex items-center gap-2"><!> <span class="text-sm">Maintenance</span></label></div></div> <div class="flex flex-col gap-2"><!> <p class="text-muted-foreground text-xs">Select monitors to filter events. Leave empty to show all global events.</p> <div class="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-md border p-2"></div> <!></div>`, 1);
var root_7 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Select which latency metric to display in the chart</p></div>`, 1);
var root_8 = $.from_html(`<iframe title="Embed preview" width="100%" frameborder="0" class="rounded"></iframe>`);
var root_9 = $.from_html(`<div><p class="flex items-center justify-between"><span class="text-sm font-semibold">Preview</span> <!></p> <p class="text-muted-foreground text-sm">See how your embed will look</p></div> <div><!></div> <div class="space-y-2"><!> <div class="flex gap-2"><!> <!></div></div> <div class="space-y-2"><!> <div class="flex gap-2"><!> <!></div></div>`, 1);
var root_10 = $.from_html(`<div class="text-muted-foreground flex items-center justify-center py-12 text-center">Select a monitor to preview the embed</div>`);
var root_11 = $.from_html(`<div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-4 border-r pr-4"><div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs"><!></p></div> <!> <div class="flex flex-col gap-2"><!> <div class="flex gap-2"><!> <!></div></div> <!> <!> <!> <div class="flex flex-col gap-2"><!> <div class="flex gap-2"><!> <!></div> <p class="text-muted-foreground text-xs"><!></p></div></div> <div class="flex flex-col gap-4"><!></div></div>`);
var root_12 = $.from_html(`<div class="flex flex-col gap-6"><!></div>`);
var root_13 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Monitors state
	let monitors = $.state($.proxy([]));

	let loading = $.state(true);
	let domain = $.state("");
	let protocol = $.state("");

	// Embed configuration
	let embedConfig = $.proxy({
		tag: "",
		embedType: "status",
		theme: mode.current === "dark" ? "dark" : "light",
		format: "iframe",
		days: 90,
		height: 200,
		metric: "average",
		// Events-specific config
		showIncidents: true,
		showMaintenance: true,
		selectedTags: []
	});

	// Preview key for refreshing
	let previewKey = $.state(0);

	// Days presets
	const daysPresets = [
		{ label: "7 Days", value: 7 },
		{ label: "30 Days", value: 30 },
		{ label: "60 Days", value: 60 },
		{ label: "90 Days", value: 90 }
	];

	// Height presets
	const heightPresets = [
		{ label: "100px", value: 100 },
		{ label: "150px", value: 150 },
		{ label: "200px", value: 200 },
		{ label: "250px", value: 250 },
		{ label: "300px", value: 300 }
	];

	// Build the embed URL
	const embedUrl = $.derived(() => {
		if (!$.get(protocol) || !$.get(domain)) return "";

		if (embedConfig.embedType === "events") {
			const embedPath = `/embed/events/live`;

			return `${$.get(protocol)}//${$.get(domain)}` + clientResolver(resolve, embedPath);
		}

		if (!embedConfig.tag) return "";

		const embedPath = embedConfig.embedType === "status"
			? `/embed/monitor-${embedConfig.tag}`
			: `/embed/latency-${embedConfig.tag}`;

		return `${$.get(protocol)}//${$.get(domain)}` + clientResolver(resolve, embedPath);
	});

	// Build the preview URL with parameters
	const previewUrl = $.derived(() => {
		if (!$.get(embedUrl)) return "";

		const params = new URLSearchParams();

		params.set("theme", embedConfig.theme);

		if (embedConfig.embedType === "events") {
			params.set("incidents", embedConfig.showIncidents ? "1" : "0");
			params.set("maintenance", embedConfig.showMaintenance ? "1" : "0");

			if (embedConfig.selectedTags.length > 0) {
				params.set("tags", embedConfig.selectedTags.join(","));
			}
		} else {
			params.set("days", embedConfig.days.toString());

			if (embedConfig.embedType === "latency") {
				params.set("height", embedConfig.height.toString());

				if (embedConfig.metric !== "average") {
					params.set("metric", embedConfig.metric);
				}
			}
		}

		return `${$.get(embedUrl)}?${params.toString()}`;
	});

	// Build the embed code
	const embedCode = $.derived(() => {
		if (!$.get(embedUrl)) return "";

		const params = new URLSearchParams();

		params.set("theme", embedConfig.theme);

		if (embedConfig.embedType === "events") {
			params.set("incidents", embedConfig.showIncidents ? "1" : "0");
			params.set("maintenance", embedConfig.showMaintenance ? "1" : "0");

			if (embedConfig.selectedTags.length > 0) {
				params.set("tags", embedConfig.selectedTags.join(","));
			}

			const fullUrl = `${$.get(embedUrl)}?${params.toString()}`;
			const iframeHeight = 300;

			if (embedConfig.format === "iframe") {
				return `<iframe src="${fullUrl}" width="100%" height="${iframeHeight}" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`;
			}

			return `<script src="${$.get(embedUrl)}/js?${params.toString()}"><` + "/script>";
		}

		params.set("days", embedConfig.days.toString());

		if (embedConfig.embedType === "latency") {
			params.set("height", embedConfig.height.toString());

			if (embedConfig.metric !== "average") {
				params.set("metric", embedConfig.metric);
			}
		}

		const fullUrl = `${$.get(embedUrl)}?${params.toString()}`;
		const iframeHeight = embedConfig.embedType === "status" ? 70 : embedConfig.height + 50;

		if (embedConfig.format === "iframe") {
			return `<iframe src="${fullUrl}" width="100%" height="${iframeHeight}" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`;
		}

		return `<script src="${$.get(embedUrl)}/js?theme=${embedConfig.theme}&days=${embedConfig.days}${embedConfig.embedType === "latency"
			? `&height=${embedConfig.height}${embedConfig.metric !== "average" ? `&metric=${embedConfig.metric}` : ""}`
			: ""}"><` + "/script>";
	});

	// HTML snippet
	const htmlSnippet = $.derived(() => {
		return $.get(embedCode);
	});

	async function fetchMonitors() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getMonitors", data: { status: "ACTIVE" } })
			});

			const result = await response.json();

			if (!result.error) {
				$.set(monitors, result, true);

				// Set default tag to first monitor
				if ($.get(monitors).length > 0) {
					embedConfig.tag = $.get(monitors)[0].tag;
				}
			}
		} catch {
			// Ignore errors
		}
	}

	function refreshPreview() {
		$.update(previewKey);
	}

	onMount(async () => {
		$.set(protocol, window.location.protocol, true);
		$.set(domain, window.location.host, true);
		$.set(loading, true);
		await fetchMonitors();
		$.set(loading, false);
	});

	var div = root_13();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, { class: 'size-8' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_3 = ($$anchor) => {
			var div_2 = root_12();
			var node_2 = $.child(div_2);

			$.component(node_2, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment = root_1();
						var node_3 = $.first_child(fragment);

						$.component(node_3, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_1 = root_1();
									var node_4 = $.first_child(fragment_1);

									$.component(node_4, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Embed Generator');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Create customizable embeds to display the status or latency of your monitors on external websites');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_1);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_3, 2);

						$.component(node_6, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_3 = root_11();
									var div_4 = $.child(div_3);
									var div_5 = $.child(div_4);
									var node_7 = $.child(div_5);

									Label(node_7, {
										for: 'embed-type',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Embed Type');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return embedConfig.embedType;
											},

											onValueChange: (v) => {
												if (v) embedConfig.embedType = v;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_2 = root_1();
												var node_9 = $.first_child(fragment_2);

												$.component(node_9, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														id: 'embed-type',
														class: 'w-full capitalize',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, embedConfig.embedType === "status"
																? "Status Bar"
																: embedConfig.embedType === "latency" ? "Latency Chart" : "Live Events"));

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root_2();
															var node_11 = $.first_child(fragment_4);

															$.component(node_11, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	value: 'status',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Status Bar');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Select.Item, ($$anchor, Select_Item_1) => {
																Select_Item_1($$anchor, {
																	value: 'latency',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('Latency Chart');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															var node_13 = $.sibling(node_12, 2);

															$.component(node_13, () => Select.Item, ($$anchor, Select_Item_2) => {
																Select_Item_2($$anchor, {
																	value: 'events',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Live Events');

																		$.append($$anchor, text_6);
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

									var p = $.sibling(node_8, 2);
									var node_14 = $.child(p);

									{
										var consequent_1 = ($$anchor) => {
											var text_7 = $.text('Shows a status bar with uptime percentage and daily status indicators');

											$.append($$anchor, text_7);
										};

										var consequent_2 = ($$anchor) => {
											var text_8 = $.text('Shows a latency trend chart over time');

											$.append($$anchor, text_8);
										};

										var alternate = ($$anchor) => {
											var text_9 = $.text('Shows ongoing incidents and maintenance events in real time');

											$.append($$anchor, text_9);
										};

										$.if(node_14, ($$render) => {
											if (embedConfig.embedType === "status") $$render(consequent_1); else if (embedConfig.embedType === "latency") $$render(consequent_2, 1); else $$render(alternate, -1);
										});
									}

									$.reset(p);
									$.reset(div_5);

									var node_15 = $.sibling(div_5, 2);

									{
										var consequent_3 = ($$anchor) => {
											var div_6 = root_3();
											var node_16 = $.child(div_6);

											Label(node_16, {
												for: 'monitor-select',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Monitor');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});

											var node_17 = $.sibling(node_16, 2);

											$.component(node_17, () => Select.Root, ($$anchor, Select_Root_1) => {
												Select_Root_1($$anchor, {
													type: 'single',
													get value() {
														return embedConfig.tag;
													},

													onValueChange: (v) => {
														if (v) embedConfig.tag = v;
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_1();
														var node_18 = $.first_child(fragment_5);

														$.component(node_18, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
															Select_Trigger_1($$anchor, {
																id: 'monitor-select',
																class: 'w-full',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_11 = $.text();

																	$.template_effect(($0) => $.set_text(text_11, $0), [
																		() => $.get(monitors).find((m) => m.tag === embedConfig.tag)?.name || "Select a monitor"
																	]);

																	$.append($$anchor, text_11);
																},
																$$slots: { default: true }
															});
														});

														var node_19 = $.sibling(node_18, 2);

														$.component(node_19, () => Select.Content, ($$anchor, Select_Content_1) => {
															Select_Content_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_20 = $.first_child(fragment_7);

																	$.each(node_20, 17, () => $.get(monitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
																		var fragment_8 = $.comment();
																		var node_21 = $.first_child(fragment_8);

																		$.component(node_21, () => Select.Item, ($$anchor, Select_Item_3) => {
																			Select_Item_3($$anchor, {
																				get value() {
																					return $.get(monitor).tag;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_12 = $.text();

																					$.template_effect(() => $.set_text(text_12, $.get(monitor).name));
																					$.append($$anchor, text_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_8);
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

											$.reset(div_6);
											$.append($$anchor, div_6);
										};

										$.if(node_15, ($$render) => {
											if (embedConfig.embedType !== "events") $$render(consequent_3);
										});
									}

									var div_7 = $.sibling(node_15, 2);
									var node_22 = $.child(div_7);

									Label(node_22, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_13 = $.text('Theme');

											$.append($$anchor, text_13);
										},
										$$slots: { default: true }
									});

									var div_8 = $.sibling(node_22, 2);
									var node_23 = $.child(div_8);

									{
										let $0 = $.derived(() => embedConfig.theme === "light" ? "default" : "outline");

										Button(node_23, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											onclick: () => embedConfig.theme = "light",
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Light');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});
									}

									var node_24 = $.sibling(node_23, 2);

									{
										let $0 = $.derived(() => embedConfig.theme === "dark" ? "default" : "outline");

										Button(node_24, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											onclick: () => embedConfig.theme = "dark",
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Dark');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_8);
									$.reset(div_7);

									var node_25 = $.sibling(div_7, 2);

									{
										var consequent_5 = ($$anchor) => {
											var fragment_10 = root_6();
											var div_9 = $.first_child(fragment_10);
											var node_26 = $.child(div_9);

											Label(node_26, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Show');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});

											var div_10 = $.sibling(node_26, 2);
											var label = $.child(div_10);
											var node_27 = $.child(label);

											Checkbox(node_27, {
												get checked() {
													return embedConfig.showIncidents;
												},

												onCheckedChange: (v) => {
													embedConfig.showIncidents = !!v;
												}
											});

											$.next(2);
											$.reset(label);

											var label_1 = $.sibling(label, 2);
											var node_28 = $.child(label_1);

											Checkbox(node_28, {
												get checked() {
													return embedConfig.showMaintenance;
												},

												onCheckedChange: (v) => {
													embedConfig.showMaintenance = !!v;
												}
											});

											$.next(2);
											$.reset(label_1);
											$.reset(div_10);
											$.reset(div_9);

											var div_11 = $.sibling(div_9, 2);
											var node_29 = $.child(div_11);

											Label(node_29, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Filter by Monitors');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});

											var div_12 = $.sibling(node_29, 4);

											$.each(div_12, 21, () => $.get(monitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
												var label_2 = root_4();
												var node_30 = $.child(label_2);

												{
													let $0 = $.derived(() => embedConfig.selectedTags.includes($.get(monitor).tag));

													Checkbox(node_30, {
														get checked() {
															return $.get($0);
														},

														onCheckedChange: (v) => {
															if (v) {
																embedConfig.selectedTags = [...embedConfig.selectedTags, $.get(monitor).tag];
															} else {
																embedConfig.selectedTags = embedConfig.selectedTags.filter((t) => t !== $.get(monitor).tag);
															}
														}
													});
												}

												var span = $.sibling(node_30, 2);
												var text_18 = $.only_child(span, true);

												$.reset(label_2);
												$.template_effect(() => $.set_text(text_18, $.get(monitor).name));
												$.append($$anchor, label_2);
											});

											$.reset(div_12);

											var node_31 = $.sibling(div_12, 2);

											{
												var consequent_4 = ($$anchor) => {
													var button = root_5();

													$.delegated('click', button, () => embedConfig.selectedTags = []);
													$.append($$anchor, button);
												};

												$.if(node_31, ($$render) => {
													if (embedConfig.selectedTags.length > 0) $$render(consequent_4);
												});
											}

											$.reset(div_11);
											$.append($$anchor, fragment_10);
										};

										$.if(node_25, ($$render) => {
											if (embedConfig.embedType === "events") $$render(consequent_5);
										});
									}

									var node_32 = $.sibling(node_25, 2);

									{
										var consequent_6 = ($$anchor) => {
											var div_13 = root_3();
											var node_33 = $.child(div_13);

											Label(node_33, {
												for: 'days-select',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_19 = $.text('Time Period');

													$.append($$anchor, text_19);
												},
												$$slots: { default: true }
											});

											var node_34 = $.sibling(node_33, 2);

											{
												let $0 = $.derived(() => embedConfig.days.toString());

												$.component(node_34, () => Select.Root, ($$anchor, Select_Root_2) => {
													Select_Root_2($$anchor, {
														type: 'single',
														get value() {
															return $.get($0);
														},

														onValueChange: (v) => {
															if (v) embedConfig.days = parseInt(v);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_1();
															var node_35 = $.first_child(fragment_11);

															$.component(node_35, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
																Select_Trigger_2($$anchor, {
																	id: 'days-select',
																	class: 'w-full',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_20 = $.text();

																		$.template_effect(($0) => $.set_text(text_20, $0), [
																			() => daysPresets.find((d) => d.value === embedConfig.days)?.label || `${embedConfig.days} Days`
																		]);

																		$.append($$anchor, text_20);
																	},
																	$$slots: { default: true }
																});
															});

															var node_36 = $.sibling(node_35, 2);

															$.component(node_36, () => Select.Content, ($$anchor, Select_Content_2) => {
																Select_Content_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = $.comment();
																		var node_37 = $.first_child(fragment_13);

																		$.each(node_37, 17, () => daysPresets, (preset) => preset.value, ($$anchor, preset) => {
																			var fragment_14 = $.comment();
																			var node_38 = $.first_child(fragment_14);

																			{
																				let $0 = $.derived(() => $.get(preset).value.toString());

																				$.component(node_38, () => Select.Item, ($$anchor, Select_Item_4) => {
																					Select_Item_4($$anchor, {
																						get value() {
																							return $.get($0);
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_21 = $.text();

																							$.template_effect(() => $.set_text(text_21, $.get(preset).label));
																							$.append($$anchor, text_21);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_14);
																		});

																		$.append($$anchor, fragment_13);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});
											}

											$.reset(div_13);
											$.append($$anchor, div_13);
										};

										$.if(node_32, ($$render) => {
											if (embedConfig.embedType !== "events") $$render(consequent_6);
										});
									}

									var node_39 = $.sibling(node_32, 2);

									{
										var consequent_7 = ($$anchor) => {
											var fragment_16 = root_7();
											var div_14 = $.first_child(fragment_16);
											var node_40 = $.child(div_14);

											Label(node_40, {
												for: 'height-select',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_22 = $.text('Chart Height');

													$.append($$anchor, text_22);
												},
												$$slots: { default: true }
											});

											var node_41 = $.sibling(node_40, 2);

											{
												let $0 = $.derived(() => embedConfig.height.toString());

												$.component(node_41, () => Select.Root, ($$anchor, Select_Root_3) => {
													Select_Root_3($$anchor, {
														type: 'single',
														get value() {
															return $.get($0);
														},

														onValueChange: (v) => {
															if (v) embedConfig.height = parseInt(v);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_17 = root_1();
															var node_42 = $.first_child(fragment_17);

															$.component(node_42, () => Select.Trigger, ($$anchor, Select_Trigger_3) => {
																Select_Trigger_3($$anchor, {
																	id: 'height-select',
																	class: 'w-full',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_23 = $.text();

																		$.template_effect(($0) => $.set_text(text_23, $0), [
																			() => heightPresets.find((h) => h.value === embedConfig.height)?.label || `${embedConfig.height}px`
																		]);

																		$.append($$anchor, text_23);
																	},
																	$$slots: { default: true }
																});
															});

															var node_43 = $.sibling(node_42, 2);

															$.component(node_43, () => Select.Content, ($$anchor, Select_Content_3) => {
																Select_Content_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = $.comment();
																		var node_44 = $.first_child(fragment_19);

																		$.each(node_44, 17, () => heightPresets, (preset) => preset.value, ($$anchor, preset) => {
																			var fragment_20 = $.comment();
																			var node_45 = $.first_child(fragment_20);

																			{
																				let $0 = $.derived(() => $.get(preset).value.toString());

																				$.component(node_45, () => Select.Item, ($$anchor, Select_Item_5) => {
																					Select_Item_5($$anchor, {
																						get value() {
																							return $.get($0);
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_24 = $.text();

																							$.template_effect(() => $.set_text(text_24, $.get(preset).label));
																							$.append($$anchor, text_24);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_20);
																		});

																		$.append($$anchor, fragment_19);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_17);
														},
														$$slots: { default: true }
													});
												});
											}

											$.reset(div_14);

											var div_15 = $.sibling(div_14, 2);
											var node_46 = $.child(div_15);

											Label(node_46, {
												for: 'metric-select',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Latency Metric');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});

											var node_47 = $.sibling(node_46, 2);

											$.component(node_47, () => Select.Root, ($$anchor, Select_Root_4) => {
												Select_Root_4($$anchor, {
													type: 'single',
													get value() {
														return embedConfig.metric;
													},

													onValueChange: (v) => {
														if (v) embedConfig.metric = v;
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_22 = root_1();
														var node_48 = $.first_child(fragment_22);

														$.component(node_48, () => Select.Trigger, ($$anchor, Select_Trigger_4) => {
															Select_Trigger_4($$anchor, {
																id: 'metric-select',
																class: 'w-full capitalize',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_26 = $.text();

																	$.template_effect(() => $.set_text(text_26, embedConfig.metric === "average"
																		? "Average"
																		: embedConfig.metric === "maximum" ? "Maximum" : "Minimum"));

																	$.append($$anchor, text_26);
																},
																$$slots: { default: true }
															});
														});

														var node_49 = $.sibling(node_48, 2);

														$.component(node_49, () => Select.Content, ($$anchor, Select_Content_4) => {
															Select_Content_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_24 = root_2();
																	var node_50 = $.first_child(fragment_24);

																	$.component(node_50, () => Select.Item, ($$anchor, Select_Item_6) => {
																		Select_Item_6($$anchor, {
																			value: 'average',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_27 = $.text('Average');

																				$.append($$anchor, text_27);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_51 = $.sibling(node_50, 2);

																	$.component(node_51, () => Select.Item, ($$anchor, Select_Item_7) => {
																		Select_Item_7($$anchor, {
																			value: 'maximum',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_28 = $.text('Maximum');

																				$.append($$anchor, text_28);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_52 = $.sibling(node_51, 2);

																	$.component(node_52, () => Select.Item, ($$anchor, Select_Item_8) => {
																		Select_Item_8($$anchor, {
																			value: 'minimum',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_29 = $.text('Minimum');

																				$.append($$anchor, text_29);
																			},
																			$$slots: { default: true }
																		});
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

											$.next(2);
											$.reset(div_15);
											$.append($$anchor, fragment_16);
										};

										$.if(node_39, ($$render) => {
											if (embedConfig.embedType === "latency") $$render(consequent_7);
										});
									}

									var div_16 = $.sibling(node_39, 2);
									var node_53 = $.child(div_16);

									Label(node_53, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_30 = $.text('Embed Format');

											$.append($$anchor, text_30);
										},
										$$slots: { default: true }
									});

									var div_17 = $.sibling(node_53, 2);
									var node_54 = $.child(div_17);

									{
										let $0 = $.derived(() => embedConfig.format === "iframe" ? "default" : "outline");

										Button(node_54, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											onclick: () => embedConfig.format = "iframe",
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_31 = $.text('iFrame');

												$.append($$anchor, text_31);
											},
											$$slots: { default: true }
										});
									}

									var node_55 = $.sibling(node_54, 2);

									{
										let $0 = $.derived(() => embedConfig.format === "script" ? "default" : "outline");

										Button(node_55, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											onclick: () => embedConfig.format = "script",
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_32 = $.text('Script');

												$.append($$anchor, text_32);
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_17);

									var p_1 = $.sibling(div_17, 2);
									var node_56 = $.child(p_1);

									{
										var consequent_8 = ($$anchor) => {
											var text_33 = $.text('Use an iframe to embed the widget. Works on most websites.');

											$.append($$anchor, text_33);
										};

										var alternate_1 = ($$anchor) => {
											var text_34 = $.text('Use a script tag for dynamic embedding. May require CSP configuration.');

											$.append($$anchor, text_34);
										};

										$.if(node_56, ($$render) => {
											if (embedConfig.format === "iframe") $$render(consequent_8); else $$render(alternate_1, -1);
										});
									}

									$.reset(p_1);
									$.reset(div_16);
									$.reset(div_4);

									var div_18 = $.sibling(div_4, 2);
									var node_57 = $.child(div_18);

									{
										var consequent_9 = ($$anchor) => {
											var fragment_25 = root_9();
											var div_19 = $.first_child(fragment_25);
											var p_2 = $.child(div_19);
											var node_58 = $.sibling($.child(p_2), 2);

											Button(node_58, {
												variant: 'ghost',
												size: 'icon-sm',
												onclick: refreshPreview,
												children: ($$anchor, $$slotProps) => {
													RefreshCwIcon($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});

											$.reset(p_2);
											$.next(2);
											$.reset(div_19);

											var div_20 = $.sibling(div_19, 2);
											let classes;
											var node_59 = $.child(div_20);

											$.key(node_59, () => $.get(previewKey), ($$anchor) => {
												var fragment_27 = $.comment();
												var node_60 = $.first_child(fragment_27);

												$.key(node_60, () => embedConfig, ($$anchor) => {
													var iframe = root_8();

													$.template_effect(() => {
														$.set_attribute(iframe, 'src', $.get(previewUrl));

														$.set_attribute(iframe, 'height', embedConfig.embedType === "status"
															? 70
															: embedConfig.embedType === "events" ? 300 : embedConfig.height + 50);
													});

													$.append($$anchor, iframe);
												});

												$.append($$anchor, fragment_27);
											});

											$.reset(div_20);

											var div_21 = $.sibling(div_20, 2);
											var node_61 = $.child(div_21);

											Label(node_61, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_35 = $.text('Embed URL');

													$.append($$anchor, text_35);
												},
												$$slots: { default: true }
											});

											var div_22 = $.sibling(node_61, 2);
											var node_62 = $.child(div_22);

											Input(node_62, {
												readonly: true,
												get value() {
													return $.get(previewUrl);
												},
												class: 'font-mono text-xs'
											});

											var node_63 = $.sibling(node_62, 2);

											CopyButton(node_63, {
												variant: 'outline',
												size: 'icon',
												get text() {
													return $.get(previewUrl);
												},

												children: ($$anchor, $$slotProps) => {
													CopyIcon($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});

											$.reset(div_22);
											$.reset(div_21);

											var div_23 = $.sibling(div_21, 2);
											var node_64 = $.child(div_23);

											Label(node_64, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_36 = $.text('Embed Code');

													$.append($$anchor, text_36);
												},
												$$slots: { default: true }
											});

											var div_24 = $.sibling(node_64, 2);
											var node_65 = $.child(div_24);

											Input(node_65, {
												readonly: true,
												get value() {
													return $.get(htmlSnippet);
												},
												class: 'font-mono text-xs'
											});

											var node_66 = $.sibling(node_65, 2);

											CopyButton(node_66, {
												variant: 'outline',
												size: 'icon',
												get text() {
													return $.get(htmlSnippet);
												},

												children: ($$anchor, $$slotProps) => {
													CopyIcon($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});

											$.reset(div_24);
											$.reset(div_23);
											$.template_effect(() => classes = $.set_class(div_20, 1, 'bg-muted/50 flex items-center justify-center rounded-lg border p-4', null, classes, { 'bg-zinc-900': embedConfig.theme === "dark" }));
											$.append($$anchor, fragment_25);
										};

										var alternate_2 = ($$anchor) => {
											var div_25 = root_10();

											$.append($$anchor, div_25);
										};

										$.if(node_57, ($$render) => {
											if (embedConfig.tag || embedConfig.embedType === "events") $$render(consequent_9); else $$render(alternate_2, -1);
										});
									}

									$.reset(div_18);
									$.reset(div_3);
									$.append($$anchor, div_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate_3, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);