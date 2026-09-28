import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import CopyButton from "$lib/components/CopyButton.svelte";
import ColorPicker from "svelte-awesome-color-picker";
import CopyIcon from "@lucide/svelte/icons/copy";
import EyeIcon from "@lucide/svelte/icons/eye";
import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
import { BADGE_STYLES } from "$lib/global-constants.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { availableLocalesList } from "$lib/stores/i18n";

var root = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Status text will be shown in the selected language</p></div>`);
var root_4 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Don't show the time period on the badge</p></div> <!></div>`, 1);
var root_5 = $.from_html(`<div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Select which latency metric to display on the badge</p></div>`);
var root_6 = $.from_html(`<img alt="Badge preview" class="max-w-full"/>`);
var root_7 = $.from_html(`<div><p class="flex items-center justify-between"><span>Preview</span> <!></p> <p class="text-muted-foreground text-sm">See how your badge will look</p></div> <div class="bg-muted/50 flex items-center justify-center rounded-lg border p-8"><!></div> <div class="space-y-2"><!> <div class="flex gap-2"><!> <!></div></div> <div class="space-y-2"><!> <div class="flex gap-2"><!> <!></div></div> <div class="space-y-2"><!> <div class="flex gap-2"><!> <!></div></div>`, 1);
var root_8 = $.from_html(`<div class="text-muted-foreground flex items-center justify-center py-12 text-center">Select a monitor to preview the badge</div>`);
var root_9 = $.from_html(`<div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-4 border-r pr-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs"><!></p></div> <!> <!> <!> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <div class="flex items-center gap-2"><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!></div></div> <div class="flex flex-col gap-2"><!> <div class="flex items-center gap-2"><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!></div></div></div></div> <div class="flex flex-col gap-4"><!></div></div>`);
var root_10 = $.from_html(`<div class="flex flex-col gap-6"><!></div>`);
var root_11 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Monitors state
	let monitors = $.state($.proxy([]));

	let activatedLocales = $.state($.proxy([]));
	let loading = $.state(true);

	// Badge configuration
	let badgeConfig = $.proxy({
		tag: "",
		badgeType: "status",
		sinceLast: 7776000, // 90 days in seconds
		hideDuration: false,
		label: "",
		labelColor: "#555",
		color: "#0079FF",
		style: "flat",
		metric: "average",
		locale: ""
	});

	// Preview state
	let previewKey = $.state(0);

	// Duration presets in seconds
	const durationPresets = [
		{ label: "1 Hour", value: 3600 },
		{ label: "24 Hours", value: 86400 },
		{ label: "7 Days", value: 604800 },
		{ label: "30 Days", value: 2592000 },
		{ label: "90 Days", value: 7776000 }
	];

	// Build the badge URL
	const badgeUrl = $.derived(() => {
		if (!badgeConfig.tag) return "";

		const baseUrl = `${$.get(protocol)}//${$.get(domain)}` + clientResolver(resolve, `/badge/${badgeConfig.tag}/${badgeConfig.badgeType}`);
		const params = new URLSearchParams();

		// sinceLast and hideDuration only apply to uptime/latency badges
		if (badgeConfig.badgeType !== "status") {
			if (badgeConfig.sinceLast !== 7776000) {
				params.set("sinceLast", badgeConfig.sinceLast.toString());
			}

			if (badgeConfig.hideDuration) {
				params.set("hideDuration", "true");
			}
		}

		if (badgeConfig.badgeType === "latency" && badgeConfig.metric !== "average") {
			params.set("metric", badgeConfig.metric);
		}

		if (badgeConfig.label) {
			params.set("label", badgeConfig.label);
		}

		if (badgeConfig.labelColor && badgeConfig.labelColor !== "#555") {
			params.set("labelColor", badgeConfig.labelColor.replace("#", ""));
		}

		if (badgeConfig.color && badgeConfig.color !== "#0079FF") {
			params.set("color", badgeConfig.color.replace("#", ""));
		}

		if (badgeConfig.style !== "flat") {
			params.set("style", badgeConfig.style);
		}

		if (badgeConfig.badgeType === "status" && badgeConfig.locale) {
			params.set("locale", badgeConfig.locale);
		}

		const queryString = params.toString();

		return queryString ? `${baseUrl}?${queryString}` : baseUrl;
	});

	// Markdown snippet
	const markdownSnippet = $.derived(() => {
		if (!$.get(badgeUrl)) return "";

		const monitor = $.get(monitors).find((m) => m.tag === badgeConfig.tag);

		const altText = monitor
			? `${monitor.name} ${badgeConfig.badgeType}`
			: badgeConfig.badgeType;

		return `![${altText}](${$.get(badgeUrl)})`;
	});

	// HTML snippet
	const htmlSnippet = $.derived(() => {
		if (!$.get(badgeUrl)) return "";

		const monitor = $.get(monitors).find((m) => m.tag === badgeConfig.tag);

		const altText = monitor
			? `${monitor.name} ${badgeConfig.badgeType}`
			: badgeConfig.badgeType;

		return `<img src="${$.get(badgeUrl)}" alt="${altText}" />`;
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

				// Set default tag to first monitor or "_" for all
				if ($.get(monitors).length > 0) {
					badgeConfig.tag = "_";
				}
			}
		} catch {
			// Ignore errors
		}
	}

	let domain = $.state("");
	let protocol = $.state("");

	function refreshPreview() {
		$.update(previewKey);
	}

	async function fetchActivatedLocales() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getAllSiteData" })
			});

			const result = await response.json();

			if (!result.error && result.i18n?.locales) {
				const selectedCodes = new Set(result.i18n.locales.filter((l) => l.selected).map((l) => l.code));

				$.set(activatedLocales, availableLocalesList.filter((l) => selectedCodes.has(l.code)), true);
			}
		} catch {
			// Ignore errors
		}
	}

	onMount(async () => {
		$.set(protocol, window.location.protocol, true);
		$.set(domain, window.location.host, true);
		$.set(loading, true);
		await Promise.all([fetchMonitors(), fetchActivatedLocales()]);
		$.set(loading, false);
	});

	var div = root_11();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, { class: 'size-8' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_2 = ($$anchor) => {
			var div_2 = root_10();
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

												var text = $.text('Badge Generator');

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

												var text_1 = $.text('Create a customizable badge to display the status, uptime, or latency of your monitors');

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
									var div_3 = root_9();
									var div_4 = $.child(div_3);
									var div_5 = $.child(div_4);
									var node_7 = $.child(div_5);

									Label(node_7, {
										for: 'monitor-select',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Monitor');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return badgeConfig.tag;
											},

											onValueChange: (v) => {
												if (v) badgeConfig.tag = v;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_2 = root_1();
												var node_9 = $.first_child(fragment_2);

												$.component(node_9, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														id: 'monitor-select',
														class: 'w-full',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(($0) => $.set_text(text_3, $0), [
																() => badgeConfig.tag === "_"
																	? "All Monitors"
																	: $.get(monitors).find((m) => m.tag === badgeConfig.tag)?.name || "Select a monitor"
															]);

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root_1();
															var node_11 = $.first_child(fragment_4);

															$.component(node_11, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	value: '_',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('All Monitors');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															$.each(node_12, 17, () => $.get(monitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
																var fragment_5 = $.comment();
																var node_13 = $.first_child(fragment_5);

																$.component(node_13, () => Select.Item, ($$anchor, Select_Item_1) => {
																	Select_Item_1($$anchor, {
																		get value() {
																			return $.get(monitor).tag;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text();

																			$.template_effect(() => $.set_text(text_5, $.get(monitor).name));
																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
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

									$.reset(div_5);

									var div_6 = $.sibling(div_5, 2);
									var node_14 = $.child(div_6);

									Label(node_14, {
										for: 'badge-type',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Badge Type');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Select.Root, ($$anchor, Select_Root_1) => {
										Select_Root_1($$anchor, {
											type: 'single',
											get value() {
												return badgeConfig.badgeType;
											},

											onValueChange: (v) => {
												if (v) badgeConfig.badgeType = v;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_1();
												var node_16 = $.first_child(fragment_7);

												$.component(node_16, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
													Select_Trigger_1($$anchor, {
														id: 'badge-type',
														class: 'w-full capitalize',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text();

															$.template_effect(() => $.set_text(text_7, badgeConfig.badgeType));
															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => Select.Content, ($$anchor, Select_Content_1) => {
													Select_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_2();
															var node_18 = $.first_child(fragment_9);

															$.component(node_18, () => Select.Item, ($$anchor, Select_Item_2) => {
																Select_Item_2($$anchor, {
																	value: 'status',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Status');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_19 = $.sibling(node_18, 2);

															$.component(node_19, () => Select.Item, ($$anchor, Select_Item_3) => {
																Select_Item_3($$anchor, {
																	value: 'uptime',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Uptime');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_20 = $.sibling(node_19, 2);

															$.component(node_20, () => Select.Item, ($$anchor, Select_Item_4) => {
																Select_Item_4($$anchor, {
																	value: 'latency',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Latency');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var p = $.sibling(node_15, 2);
									var node_21 = $.child(p);

									{
										var consequent_1 = ($$anchor) => {
											var text_11 = $.text('Shows current real-time status (UP, DOWN, DEGRADED)');

											$.append($$anchor, text_11);
										};

										var consequent_2 = ($$anchor) => {
											var text_12 = $.text('Shows uptime percentage over a time period');

											$.append($$anchor, text_12);
										};

										var alternate = ($$anchor) => {
											var text_13 = $.text('Shows latency over a time period');

											$.append($$anchor, text_13);
										};

										$.if(node_21, ($$render) => {
											if (badgeConfig.badgeType === "status") $$render(consequent_1); else if (badgeConfig.badgeType === "uptime") $$render(consequent_2, 1); else $$render(alternate, -1);
										});
									}

									$.reset(p);
									$.reset(div_6);

									var node_22 = $.sibling(div_6, 2);

									{
										var consequent_3 = ($$anchor) => {
											var div_7 = root_3();
											var node_23 = $.child(div_7);

											Label(node_23, {
												for: 'badge-locale',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Language');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});

											var node_24 = $.sibling(node_23, 2);

											{
												let $0 = $.derived(() => badgeConfig.locale || "en");

												$.component(node_24, () => Select.Root, ($$anchor, Select_Root_2) => {
													Select_Root_2($$anchor, {
														type: 'single',
														get value() {
															return $.get($0);
														},

														onValueChange: (v) => {
															if (v) badgeConfig.locale = v === "en" ? "" : v;
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_1();
															var node_25 = $.first_child(fragment_10);

															$.component(node_25, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
																Select_Trigger_2($$anchor, {
																	id: 'badge-locale',
																	class: 'w-full',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_15 = $.text();

																		$.template_effect(($0) => $.set_text(text_15, $0), [
																			() => $.get(activatedLocales).find((l) => l.code === (badgeConfig.locale || "en"))?.name || "English"
																		]);

																		$.append($$anchor, text_15);
																	},
																	$$slots: { default: true }
																});
															});

															var node_26 = $.sibling(node_25, 2);

															$.component(node_26, () => Select.Content, ($$anchor, Select_Content_2) => {
																Select_Content_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = $.comment();
																		var node_27 = $.first_child(fragment_12);

																		$.each(node_27, 17, () => $.get(activatedLocales), (locale) => locale.code, ($$anchor, locale) => {
																			var fragment_13 = $.comment();
																			var node_28 = $.first_child(fragment_13);

																			$.component(node_28, () => Select.Item, ($$anchor, Select_Item_5) => {
																				Select_Item_5($$anchor, {
																					get value() {
																						return $.get(locale).code;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_16 = $.text();

																						$.template_effect(() => $.set_text(text_16, $.get(locale).name));
																						$.append($$anchor, text_16);
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

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});
											}

											$.next(2);
											$.reset(div_7);
											$.append($$anchor, div_7);
										};

										$.if(node_22, ($$render) => {
											if (badgeConfig.badgeType === "status" && $.get(activatedLocales).length > 0) $$render(consequent_3);
										});
									}

									var node_29 = $.sibling(node_22, 2);

									{
										var consequent_4 = ($$anchor) => {
											var fragment_15 = root_4();
											var div_8 = $.first_child(fragment_15);
											var node_30 = $.child(div_8);

											Label(node_30, {
												for: 'duration',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Time Period');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});

											var node_31 = $.sibling(node_30, 2);

											{
												let $0 = $.derived(() => badgeConfig.sinceLast.toString());

												$.component(node_31, () => Select.Root, ($$anchor, Select_Root_3) => {
													Select_Root_3($$anchor, {
														type: 'single',
														get value() {
															return $.get($0);
														},

														onValueChange: (v) => {
															if (v) badgeConfig.sinceLast = parseInt(v);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_16 = root_1();
															var node_32 = $.first_child(fragment_16);

															$.component(node_32, () => Select.Trigger, ($$anchor, Select_Trigger_3) => {
																Select_Trigger_3($$anchor, {
																	id: 'duration',
																	class: 'w-full',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_18 = $.text();

																		$.template_effect(($0) => $.set_text(text_18, $0), [
																			() => durationPresets.find((d) => d.value === badgeConfig.sinceLast)?.label || "Custom"
																		]);

																		$.append($$anchor, text_18);
																	},
																	$$slots: { default: true }
																});
															});

															var node_33 = $.sibling(node_32, 2);

															$.component(node_33, () => Select.Content, ($$anchor, Select_Content_3) => {
																Select_Content_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_18 = $.comment();
																		var node_34 = $.first_child(fragment_18);

																		$.each(node_34, 17, () => durationPresets, (preset) => preset.value, ($$anchor, preset) => {
																			var fragment_19 = $.comment();
																			var node_35 = $.first_child(fragment_19);

																			{
																				let $0 = $.derived(() => $.get(preset).value.toString());

																				$.component(node_35, () => Select.Item, ($$anchor, Select_Item_6) => {
																					Select_Item_6($$anchor, {
																						get value() {
																							return $.get($0);
																						},

																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_19 = $.text();

																							$.template_effect(() => $.set_text(text_19, $.get(preset).label));
																							$.append($$anchor, text_19);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_19);
																		});

																		$.append($$anchor, fragment_18);
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

											$.reset(div_8);

											var div_9 = $.sibling(div_8, 2);
											var div_10 = $.child(div_9);
											var node_36 = $.child(div_10);

											Label(node_36, {
												for: 'hide-duration',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_20 = $.text('Hide Duration');

													$.append($$anchor, text_20);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_10);

											var node_37 = $.sibling(div_10, 2);

											Switch(node_37, {
												id: 'hide-duration',
												get checked() {
													return badgeConfig.hideDuration;
												},
												onCheckedChange: (checked) => badgeConfig.hideDuration = checked
											});

											$.reset(div_9);
											$.append($$anchor, fragment_15);
										};

										$.if(node_29, ($$render) => {
											if (badgeConfig.badgeType !== "status") $$render(consequent_4);
										});
									}

									var node_38 = $.sibling(node_29, 2);

									{
										var consequent_5 = ($$anchor) => {
											var div_11 = root_5();
											var node_39 = $.child(div_11);

											Label(node_39, {
												for: 'latency-metric',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_21 = $.text('Latency Metric');

													$.append($$anchor, text_21);
												},
												$$slots: { default: true }
											});

											var node_40 = $.sibling(node_39, 2);

											$.component(node_40, () => Select.Root, ($$anchor, Select_Root_4) => {
												Select_Root_4($$anchor, {
													type: 'single',
													get value() {
														return badgeConfig.metric;
													},

													onValueChange: (v) => {
														if (v) badgeConfig.metric = v;
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_21 = root_1();
														var node_41 = $.first_child(fragment_21);

														$.component(node_41, () => Select.Trigger, ($$anchor, Select_Trigger_4) => {
															Select_Trigger_4($$anchor, {
																id: 'latency-metric',
																class: 'w-full capitalize',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_22 = $.text();

																	$.template_effect(() => $.set_text(text_22, badgeConfig.metric === "average"
																		? "Average"
																		: badgeConfig.metric === "maximum" ? "Maximum" : "Minimum"));

																	$.append($$anchor, text_22);
																},
																$$slots: { default: true }
															});
														});

														var node_42 = $.sibling(node_41, 2);

														$.component(node_42, () => Select.Content, ($$anchor, Select_Content_4) => {
															Select_Content_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_23 = root_2();
																	var node_43 = $.first_child(fragment_23);

																	$.component(node_43, () => Select.Item, ($$anchor, Select_Item_7) => {
																		Select_Item_7($$anchor, {
																			value: 'average',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_23 = $.text('Average');

																				$.append($$anchor, text_23);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_44 = $.sibling(node_43, 2);

																	$.component(node_44, () => Select.Item, ($$anchor, Select_Item_8) => {
																		Select_Item_8($$anchor, {
																			value: 'maximum',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_24 = $.text('Maximum');

																				$.append($$anchor, text_24);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_45 = $.sibling(node_44, 2);

																	$.component(node_45, () => Select.Item, ($$anchor, Select_Item_9) => {
																		Select_Item_9($$anchor, {
																			value: 'minimum',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_25 = $.text('Minimum');

																				$.append($$anchor, text_25);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_23);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												});
											});

											$.next(2);
											$.reset(div_11);
											$.append($$anchor, div_11);
										};

										$.if(node_38, ($$render) => {
											if (badgeConfig.badgeType === "latency") $$render(consequent_5);
										});
									}

									var div_12 = $.sibling(node_38, 2);
									var node_46 = $.child(div_12);

									Label(node_46, {
										for: 'badge-style',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_26 = $.text('Style');

											$.append($$anchor, text_26);
										},
										$$slots: { default: true }
									});

									var node_47 = $.sibling(node_46, 2);

									$.component(node_47, () => Select.Root, ($$anchor, Select_Root_5) => {
										Select_Root_5($$anchor, {
											type: 'single',
											get value() {
												return badgeConfig.style;
											},

											onValueChange: (v) => {
												if (v) badgeConfig.style = v;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_24 = root_1();
												var node_48 = $.first_child(fragment_24);

												$.component(node_48, () => Select.Trigger, ($$anchor, Select_Trigger_5) => {
													Select_Trigger_5($$anchor, {
														id: 'badge-style',
														class: 'w-full capitalize',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_27 = $.text();

															$.template_effect(() => $.set_text(text_27, badgeConfig.style));
															$.append($$anchor, text_27);
														},
														$$slots: { default: true }
													});
												});

												var node_49 = $.sibling(node_48, 2);

												$.component(node_49, () => Select.Content, ($$anchor, Select_Content_5) => {
													Select_Content_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_26 = $.comment();
															var node_50 = $.first_child(fragment_26);

															$.each(node_50, 16, () => BADGE_STYLES, (style) => style, ($$anchor, style) => {
																var fragment_27 = $.comment();
																var node_51 = $.first_child(fragment_27);

																$.component(node_51, () => Select.Item, ($$anchor, Select_Item_10) => {
																	Select_Item_10($$anchor, {
																		get value() {
																			return style;
																		},
																		class: 'capitalize',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_28 = $.text();

																			$.template_effect(() => $.set_text(text_28, style));
																			$.append($$anchor, text_28);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_27);
															});

															$.append($$anchor, fragment_26);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_24);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_12);

									var div_13 = $.sibling(div_12, 2);
									var node_52 = $.child(div_13);

									Label(node_52, {
										for: 'custom-label',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_29 = $.text('Custom Label');

											$.append($$anchor, text_29);
										},
										$$slots: { default: true }
									});

									var node_53 = $.sibling(node_52, 2);

									Input(node_53, {
										id: 'custom-label',
										placeholder: 'Leave empty to use monitor name',
										get value() {
											return badgeConfig.label;
										},

										set value($$value) {
											badgeConfig.label = $$value;
										}
									});

									$.reset(div_13);

									var div_14 = $.sibling(div_13, 2);
									var div_15 = $.child(div_14);
									var node_54 = $.child(div_15);

									Label(node_54, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_30 = $.text('Label Color');

											$.append($$anchor, text_30);
										},
										$$slots: { default: true }
									});

									var div_16 = $.sibling(node_54, 2);
									var node_55 = $.child(div_16);

									{
										$.css_props(node_55, () => ({ '--picker-width': '150px', '--picker-height': '150px' }));

										ColorPicker(node_55.lastChild, {
											label: '',
											get hex() {
												return badgeConfig.labelColor;
											},

											set hex($$value) {
												badgeConfig.labelColor = $$value;
											}
										});

										$.reset(node_55);
									}

									var node_56 = $.sibling(node_55, 2);

									Input(node_56, {
										class: 'w-24 font-mono text-xs',
										get value() {
											return badgeConfig.labelColor;
										},

										set value($$value) {
											badgeConfig.labelColor = $$value;
										}
									});

									$.reset(div_16);
									$.reset(div_15);

									var div_17 = $.sibling(div_15, 2);
									var node_57 = $.child(div_17);

									Label(node_57, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_31 = $.text('Badge Color');

											$.append($$anchor, text_31);
										},
										$$slots: { default: true }
									});

									var div_18 = $.sibling(node_57, 2);
									var node_58 = $.child(div_18);

									{
										$.css_props(node_58, () => ({ '--picker-width': '150px', '--picker-height': '150px' }));

										ColorPicker(node_58.lastChild, {
											label: '',
											get hex() {
												return badgeConfig.color;
											},

											set hex($$value) {
												badgeConfig.color = $$value;
											}
										});

										$.reset(node_58);
									}

									var node_59 = $.sibling(node_58, 2);

									Input(node_59, {
										class: 'w-24 font-mono text-xs',
										get value() {
											return badgeConfig.color;
										},

										set value($$value) {
											badgeConfig.color = $$value;
										}
									});

									$.reset(div_18);
									$.reset(div_17);
									$.reset(div_14);
									$.reset(div_4);

									var div_19 = $.sibling(div_4, 2);
									var node_60 = $.child(div_19);

									{
										var consequent_6 = ($$anchor) => {
											var fragment_29 = root_7();
											var div_20 = $.first_child(fragment_29);
											var p_1 = $.child(div_20);
											var node_61 = $.sibling($.child(p_1), 2);

											{
												let $0 = $.derived(() => !badgeConfig.tag);

												Button(node_61, {
													variant: 'ghost',
													size: 'icon-sm',
													onclick: refreshPreview,
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														RefreshCwIcon($$anchor, { class: 'size-4' });
													},
													$$slots: { default: true }
												});
											}

											$.reset(p_1);
											$.next(2);
											$.reset(div_20);

											var div_21 = $.sibling(div_20, 2);
											var node_62 = $.child(div_21);

											$.key(node_62, () => $.get(previewKey), ($$anchor) => {
												var img = root_6();

												$.template_effect(() => $.set_attribute(img, 'src', $.get(badgeUrl)));
												$.append($$anchor, img);
											});

											$.reset(div_21);

											var div_22 = $.sibling(div_21, 2);
											var node_63 = $.child(div_22);

											Label(node_63, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_32 = $.text('Badge URL');

													$.append($$anchor, text_32);
												},
												$$slots: { default: true }
											});

											var div_23 = $.sibling(node_63, 2);
											var node_64 = $.child(div_23);

											Input(node_64, {
												get value() {
													return $.get(badgeUrl);
												},
												readonly: true,
												class: 'font-mono text-xs'
											});

											var node_65 = $.sibling(node_64, 2);

											CopyButton(node_65, {
												get text() {
													return $.get(badgeUrl);
												},

												children: ($$anchor, $$slotProps) => {
													CopyIcon($$anchor, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$.reset(div_23);
											$.reset(div_22);

											var div_24 = $.sibling(div_22, 2);
											var node_66 = $.child(div_24);

											Label(node_66, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_33 = $.text('Markdown');

													$.append($$anchor, text_33);
												},
												$$slots: { default: true }
											});

											var div_25 = $.sibling(node_66, 2);
											var node_67 = $.child(div_25);

											Input(node_67, {
												get value() {
													return $.get(markdownSnippet);
												},
												readonly: true,
												class: 'font-mono text-xs'
											});

											var node_68 = $.sibling(node_67, 2);

											CopyButton(node_68, {
												get text() {
													return $.get(markdownSnippet);
												},

												children: ($$anchor, $$slotProps) => {
													CopyIcon($$anchor, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$.reset(div_25);
											$.reset(div_24);

											var div_26 = $.sibling(div_24, 2);
											var node_69 = $.child(div_26);

											Label(node_69, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_34 = $.text('HTML');

													$.append($$anchor, text_34);
												},
												$$slots: { default: true }
											});

											var div_27 = $.sibling(node_69, 2);
											var node_70 = $.child(div_27);

											Input(node_70, {
												get value() {
													return $.get(htmlSnippet);
												},
												readonly: true,
												class: 'font-mono text-xs'
											});

											var node_71 = $.sibling(node_70, 2);

											CopyButton(node_71, {
												get text() {
													return $.get(htmlSnippet);
												},

												children: ($$anchor, $$slotProps) => {
													CopyIcon($$anchor, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$.reset(div_27);
											$.reset(div_26);
											$.append($$anchor, fragment_29);
										};

										var alternate_1 = ($$anchor) => {
											var div_28 = root_8();

											$.append($$anchor, div_28);
										};

										$.if(node_60, ($$render) => {
											if (badgeConfig.tag) $$render(consequent_6); else $$render(alternate_1, -1);
										});
									}

									$.reset(div_19);
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
			if ($.get(loading)) $$render(consequent); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}