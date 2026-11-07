import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Monitors state
		let monitors = [];

		let activatedLocales = [];
		let loading = true;

		// Badge configuration
		let badgeConfig = {
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
		};

		// Preview state
		let previewKey = 0;

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

			const baseUrl = `${protocol}//${domain}` + clientResolver(resolve, `/badge/${badgeConfig.tag}/${badgeConfig.badgeType}`);
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
			if (!badgeUrl()) return "";

			const monitor = monitors.find((m) => m.tag === badgeConfig.tag);

			const altText = monitor
				? `${monitor.name} ${badgeConfig.badgeType}`
				: badgeConfig.badgeType;

			return `![${altText}](${badgeUrl()})`;
		});

		// HTML snippet
		const htmlSnippet = $.derived(() => {
			if (!badgeUrl()) return "";

			const monitor = monitors.find((m) => m.tag === badgeConfig.tag);

			const altText = monitor
				? `${monitor.name} ${badgeConfig.badgeType}`
				: badgeConfig.badgeType;

			return `<img src="${badgeUrl()}" alt="${altText}" />`;
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
					monitors = result;

					// Set default tag to first monitor or "_" for all
					if (monitors.length > 0) {
						badgeConfig.tag = "_";
					}
				}
			} catch {
				// Ignore errors
			}
		}

		let domain = "";
		let protocol = "";

		function refreshPreview() {
			previewKey++;
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

					activatedLocales = availableLocalesList.filter((l) => selectedCodes.has(l.code));
				}
			} catch {
				// Ignore errors
			}
		}

		onMount(async () => {
			protocol = window.location.protocol;
			domain = window.location.host;
			loading = true;
			await Promise.all([fetchMonitors(), fetchActivatedLocales()]);
			loading = false;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-4 p-4">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
				Spinner($$renderer, { class: 'size-8' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="flex flex-col gap-6">`);

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Badge Generator`);
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
													$$renderer.push(`<!---->Create a customizable badge to display the status, uptime, or latency of your monitors`);
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
										$$renderer.push(`<div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-4 border-r pr-4"><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'monitor-select',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Monitor`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: badgeConfig.tag,
												onValueChange: (v) => {
													if (v) badgeConfig.tag = v;
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'monitor-select',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(badgeConfig.tag === "_"
																	? "All Monitors"
																	: monitors.find((m) => m.tag === badgeConfig.tag)?.name || "Select a monitor")}`);
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
																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: '_',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->All Monitors`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <!--[-->`);

																const each_array = $.ensure_array_like(monitors);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let monitor = each_array[$$index];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: monitor.tag,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(monitor.name)}`);
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
											for: 'badge-type',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Badge Type`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: badgeConfig.badgeType,
												onValueChange: (v) => {
													if (v) badgeConfig.badgeType = v;
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'badge-type',
															class: 'w-full capitalize',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(badgeConfig.badgeType)}`);
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
																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: 'status',
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

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: 'uptime',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Uptime`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: 'latency',
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

										$$renderer.push(` <p class="text-muted-foreground text-xs">`);

										if (badgeConfig.badgeType === "status") {
											$$renderer.push(`<!--[0-->Shows current real-time status (UP, DOWN, DEGRADED)`);
										} else if (badgeConfig.badgeType === "uptime") {
											$$renderer.push(`<!--[1-->Shows uptime percentage over a time period`);
										} else {
											$$renderer.push(`<!--[-1-->Shows latency over a time period`);
										}

										$$renderer.push(`<!--]--></p></div> `);

										if (badgeConfig.badgeType === "status" && activatedLocales.length > 0) {
											$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

											Label($$renderer, {
												for: 'badge-locale',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Language`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													value: badgeConfig.locale || "en",
													onValueChange: (v) => {
														if (v) badgeConfig.locale = v === "en" ? "" : v;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'badge-locale',
																class: 'w-full',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(activatedLocales.find((l) => l.code === (badgeConfig.locale || "en"))?.name || "English")}`);
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

																	const each_array_1 = $.ensure_array_like(activatedLocales);

																	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																		let locale = each_array_1[$$index_1];

																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: locale.code,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(locale.name)}`);
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

											$$renderer.push(` <p class="text-muted-foreground text-xs">Status text will be shown in the selected language</p></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (badgeConfig.badgeType !== "status") {
											$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

											Label($$renderer, {
												for: 'duration',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Time Period`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													value: badgeConfig.sinceLast.toString(),
													onValueChange: (v) => {
														if (v) badgeConfig.sinceLast = parseInt(v);
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'duration',
																class: 'w-full',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(durationPresets.find((d) => d.value === badgeConfig.sinceLast)?.label || "Custom")}`);
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

																	const each_array_2 = $.ensure_array_like(durationPresets);

																	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																		let preset = each_array_2[$$index_2];

																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: preset.value.toString(),
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(preset.label)}`);
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

											$$renderer.push(`</div> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

											Label($$renderer, {
												for: 'hide-duration',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Hide Duration`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Don't show the time period on the badge</p></div> `);

											Switch($$renderer, {
												id: 'hide-duration',
												checked: badgeConfig.hideDuration,
												onCheckedChange: (checked) => badgeConfig.hideDuration = checked
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (badgeConfig.badgeType === "latency") {
											$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

											Label($$renderer, {
												for: 'latency-metric',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Latency Metric`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													value: badgeConfig.metric,
													onValueChange: (v) => {
														if (v) badgeConfig.metric = v;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'latency-metric',
																class: 'w-full capitalize',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(badgeConfig.metric === "average"
																		? "Average"
																		: badgeConfig.metric === "maximum" ? "Maximum" : "Minimum")}`);
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
																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: 'average',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Average`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: 'maximum',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Maximum`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: 'minimum',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Minimum`);
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

											$$renderer.push(` <p class="text-muted-foreground text-xs">Select which latency metric to display on the badge</p></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'badge-style',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Style`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: badgeConfig.style,
												onValueChange: (v) => {
													if (v) badgeConfig.style = v;
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'badge-style',
															class: 'w-full capitalize',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(badgeConfig.style)}`);
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

																const each_array_3 = $.ensure_array_like(BADGE_STYLES);

																for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																	let style = each_array_3[$$index_3];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: style,
																			class: 'capitalize',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(style)}`);
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
											for: 'custom-label',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Custom Label`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'custom-label',
											placeholder: 'Leave empty to use monitor name',
											get value() {
												return badgeConfig.label;
											},

											set value($$value) {
												badgeConfig.label = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Label Color`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="flex items-center gap-2">`);

										$.css_props($$renderer, true, { '--picker-width': '150px', '--picker-height': '150px' }, () => {
											ColorPicker($$renderer, {
												label: '',
												get hex() {
													return badgeConfig.labelColor;
												},

												set hex($$value) {
													badgeConfig.labelColor = $$value;
													$$settled = false;
												}
											});
										});

										$$renderer.push(` `);

										Input($$renderer, {
											class: 'w-24 font-mono text-xs',
											get value() {
												return badgeConfig.labelColor;
											},

											set value($$value) {
												badgeConfig.labelColor = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Badge Color`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="flex items-center gap-2">`);

										$.css_props($$renderer, true, { '--picker-width': '150px', '--picker-height': '150px' }, () => {
											ColorPicker($$renderer, {
												label: '',
												get hex() {
													return badgeConfig.color;
												},

												set hex($$value) {
													badgeConfig.color = $$value;
													$$settled = false;
												}
											});
										});

										$$renderer.push(` `);

										Input($$renderer, {
											class: 'w-24 font-mono text-xs',
											get value() {
												return badgeConfig.color;
											},

											set value($$value) {
												badgeConfig.color = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div></div></div></div> <div class="flex flex-col gap-4">`);

										if (badgeConfig.tag) {
											$$renderer.push(`<!--[0--><div><p class="flex items-center justify-between"><span>Preview</span> `);

											Button($$renderer, {
												variant: 'ghost',
												size: 'icon-sm',
												onclick: refreshPreview,
												disabled: !badgeConfig.tag,
												children: ($$renderer) => {
													RefreshCwIcon($$renderer, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></p> <p class="text-muted-foreground text-sm">See how your badge will look</p></div> <div class="bg-muted/50 flex items-center justify-center rounded-lg border p-8"><!---->`);

											{
												$$renderer.push(`<img${$.attr('src', badgeUrl())} alt="Badge preview" class="max-w-full"/>`);
											}

											$$renderer.push(`<!----></div> <div class="space-y-2">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Badge URL`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="flex gap-2">`);

											Input($$renderer, {
												value: badgeUrl(),
												readonly: true,
												class: 'font-mono text-xs'
											});

											$$renderer.push(`<!----> `);

											CopyButton($$renderer, {
												text: badgeUrl(),
												children: ($$renderer) => {
													CopyIcon($$renderer, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div></div> <div class="space-y-2">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Markdown`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="flex gap-2">`);

											Input($$renderer, {
												value: markdownSnippet(),
												readonly: true,
												class: 'font-mono text-xs'
											});

											$$renderer.push(`<!----> `);

											CopyButton($$renderer, {
												text: markdownSnippet(),
												children: ($$renderer) => {
													CopyIcon($$renderer, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div></div> <div class="space-y-2">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->HTML`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="flex gap-2">`);

											Input($$renderer, {
												value: htmlSnippet(),
												readonly: true,
												class: 'font-mono text-xs'
											});

											$$renderer.push(`<!----> `);

											CopyButton($$renderer, {
												text: htmlSnippet(),
												children: ($$renderer) => {
													CopyIcon($$renderer, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div></div>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="text-muted-foreground flex items-center justify-center py-12 text-center">Select a monitor to preview the badge</div>`);
										}

										$$renderer.push(`<!--]--></div></div>`);
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

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}