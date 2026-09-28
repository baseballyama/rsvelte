import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Monitors state
		let monitors = [];

		let loading = true;
		let domain = "";
		let protocol = "";

		// Embed configuration
		let embedConfig = {
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
		};

		// Preview key for refreshing
		let previewKey = 0;

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
			if (!protocol || !domain) return "";

			if (embedConfig.embedType === "events") {
				const embedPath = `/embed/events/live`;

				return `${protocol}//${domain}` + clientResolver(resolve, embedPath);
			}

			if (!embedConfig.tag) return "";

			const embedPath = embedConfig.embedType === "status"
				? `/embed/monitor-${embedConfig.tag}`
				: `/embed/latency-${embedConfig.tag}`;

			return `${protocol}//${domain}` + clientResolver(resolve, embedPath);
		});

		// Build the preview URL with parameters
		const previewUrl = $.derived(() => {
			if (!embedUrl()) return "";

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

			return `${embedUrl()}?${params.toString()}`;
		});

		// Build the embed code
		const embedCode = $.derived(() => {
			if (!embedUrl()) return "";

			const params = new URLSearchParams();

			params.set("theme", embedConfig.theme);

			if (embedConfig.embedType === "events") {
				params.set("incidents", embedConfig.showIncidents ? "1" : "0");
				params.set("maintenance", embedConfig.showMaintenance ? "1" : "0");

				if (embedConfig.selectedTags.length > 0) {
					params.set("tags", embedConfig.selectedTags.join(","));
				}

				const fullUrl = `${embedUrl()}?${params.toString()}`;
				const iframeHeight = 300;

				if (embedConfig.format === "iframe") {
					return `<iframe src="${fullUrl}" width="100%" height="${iframeHeight}" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`;
				}

				return `<script src="${embedUrl()}/js?${params.toString()}"><` + "/script>";
			}

			params.set("days", embedConfig.days.toString());

			if (embedConfig.embedType === "latency") {
				params.set("height", embedConfig.height.toString());

				if (embedConfig.metric !== "average") {
					params.set("metric", embedConfig.metric);
				}
			}

			const fullUrl = `${embedUrl()}?${params.toString()}`;
			const iframeHeight = embedConfig.embedType === "status" ? 70 : embedConfig.height + 50;

			if (embedConfig.format === "iframe") {
				return `<iframe src="${fullUrl}" width="100%" height="${iframeHeight}" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`;
			}

			return `<script src="${embedUrl()}/js?theme=${embedConfig.theme}&days=${embedConfig.days}${embedConfig.embedType === "latency"
				? `&height=${embedConfig.height}${embedConfig.metric !== "average" ? `&metric=${embedConfig.metric}` : ""}`
				: ""}"><` + "/script>";
		});

		// HTML snippet
		const htmlSnippet = $.derived(() => {
			return embedCode();
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

					// Set default tag to first monitor
					if (monitors.length > 0) {
						embedConfig.tag = monitors[0].tag;
					}
				}
			} catch {
				// Ignore errors
			}
		}

		function refreshPreview() {
			previewKey++;
		}

		onMount(async () => {
			protocol = window.location.protocol;
			domain = window.location.host;
			loading = true;
			await fetchMonitors();
			loading = false;
		});

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
												$$renderer.push(`<!---->Embed Generator`);
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
												$$renderer.push(`<!---->Create customizable embeds to display the status or latency of your monitors on external websites`);
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
										for: 'embed-type',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Embed Type`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											value: embedConfig.embedType,
											onValueChange: (v) => {
												if (v) embedConfig.embedType = v;
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														id: 'embed-type',
														class: 'w-full capitalize',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(embedConfig.embedType === "status"
																? "Status Bar"
																: embedConfig.embedType === "latency" ? "Latency Chart" : "Live Events")}`);
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
																		$$renderer.push(`<!---->Status Bar`);
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
																		$$renderer.push(`<!---->Latency Chart`);
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
																	value: 'events',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Live Events`);
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

									if (embedConfig.embedType === "status") {
										$$renderer.push(`<!--[0-->Shows a status bar with uptime percentage and daily status indicators`);
									} else if (embedConfig.embedType === "latency") {
										$$renderer.push(`<!--[1-->Shows a latency trend chart over time`);
									} else {
										$$renderer.push(`<!--[-1-->Shows ongoing incidents and maintenance events in real time`);
									}

									$$renderer.push(`<!--]--></p></div> `);

									if (embedConfig.embedType !== "events") {
										$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

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
												value: embedConfig.tag,
												onValueChange: (v) => {
													if (v) embedConfig.tag = v;
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'monitor-select',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(monitors.find((m) => m.tag === embedConfig.tag)?.name || "Select a monitor")}`);
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

										$$renderer.push(`</div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Theme`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex gap-2">`);

									Button($$renderer, {
										variant: embedConfig.theme === "light" ? "default" : "outline",
										size: 'sm',
										onclick: () => embedConfig.theme = "light",
										children: ($$renderer) => {
											$$renderer.push(`<!---->Light`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										variant: embedConfig.theme === "dark" ? "default" : "outline",
										size: 'sm',
										onclick: () => embedConfig.theme = "dark",
										children: ($$renderer) => {
											$$renderer.push(`<!---->Dark`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div> `);

									if (embedConfig.embedType === "events") {
										$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Show`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="flex flex-col gap-2"><label class="flex items-center gap-2">`);

										Checkbox($$renderer, {
											checked: embedConfig.showIncidents,
											onCheckedChange: (v) => {
												embedConfig.showIncidents = !!v;
											}
										});

										$$renderer.push(`<!----> <span class="text-sm">Incidents</span></label> <label class="flex items-center gap-2">`);

										Checkbox($$renderer, {
											checked: embedConfig.showMaintenance,
											onCheckedChange: (v) => {
												embedConfig.showMaintenance = !!v;
											}
										});

										$$renderer.push(`<!----> <span class="text-sm">Maintenance</span></label></div></div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Filter by Monitors`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Select monitors to filter events. Leave empty to show all global events.</p> <div class="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-md border p-2"><!--[-->`);

										const each_array_1 = $.ensure_array_like(monitors);

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let monitor = each_array_1[$$index_1];

											$$renderer.push(`<label class="flex items-center gap-2">`);

											Checkbox($$renderer, {
												checked: embedConfig.selectedTags.includes(monitor.tag),
												onCheckedChange: (v) => {
													if (v) {
														embedConfig.selectedTags = [...embedConfig.selectedTags, monitor.tag];
													} else {
														embedConfig.selectedTags = embedConfig.selectedTags.filter((t) => t !== monitor.tag);
													}
												}
											});

											$$renderer.push(`<!----> <span class="text-sm">${$.escape(monitor.name)}</span></label>`);
										}

										$$renderer.push(`<!--]--></div> `);

										if (embedConfig.selectedTags.length > 0) {
											$$renderer.push(`<!--[0--><button class="text-muted-foreground self-start text-xs underline hover:no-underline">Clear selection</button>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (embedConfig.embedType !== "events") {
										$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'days-select',
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
												value: embedConfig.days.toString(),
												onValueChange: (v) => {
													if (v) embedConfig.days = parseInt(v);
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'days-select',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(daysPresets.find((d) => d.value === embedConfig.days)?.label || `${embedConfig.days} Days`)}`);
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

																const each_array_2 = $.ensure_array_like(daysPresets);

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

										$$renderer.push(`</div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (embedConfig.embedType === "latency") {
										$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'height-select',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Chart Height`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: embedConfig.height.toString(),
												onValueChange: (v) => {
													if (v) embedConfig.height = parseInt(v);
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'height-select',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(heightPresets.find((h) => h.value === embedConfig.height)?.label || `${embedConfig.height}px`)}`);
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

																const each_array_3 = $.ensure_array_like(heightPresets);

																for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																	let preset = each_array_3[$$index_3];

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

										$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'metric-select',
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
												value: embedConfig.metric,
												onValueChange: (v) => {
													if (v) embedConfig.metric = v;
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'metric-select',
															class: 'w-full capitalize',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(embedConfig.metric === "average"
																	? "Average"
																	: embedConfig.metric === "maximum" ? "Maximum" : "Minimum")}`);
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

										$$renderer.push(` <p class="text-muted-foreground text-xs">Select which latency metric to display in the chart</p></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Embed Format`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex gap-2">`);

									Button($$renderer, {
										variant: embedConfig.format === "iframe" ? "default" : "outline",
										size: 'sm',
										onclick: () => embedConfig.format = "iframe",
										children: ($$renderer) => {
											$$renderer.push(`<!---->iFrame`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										variant: embedConfig.format === "script" ? "default" : "outline",
										size: 'sm',
										onclick: () => embedConfig.format = "script",
										children: ($$renderer) => {
											$$renderer.push(`<!---->Script`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> <p class="text-muted-foreground text-xs">`);

									if (embedConfig.format === "iframe") {
										$$renderer.push(`<!--[0-->Use an iframe to embed the widget. Works on most websites.`);
									} else {
										$$renderer.push(`<!--[-1-->Use a script tag for dynamic embedding. May require CSP configuration.`);
									}

									$$renderer.push(`<!--]--></p></div></div> <div class="flex flex-col gap-4">`);

									if (embedConfig.tag || embedConfig.embedType === "events") {
										$$renderer.push(`<!--[0--><div><p class="flex items-center justify-between"><span class="text-sm font-semibold">Preview</span> `);

										Button($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											onclick: refreshPreview,
											children: ($$renderer) => {
												RefreshCwIcon($$renderer, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></p> <p class="text-muted-foreground text-sm">See how your embed will look</p></div> <div${$.attr_class('bg-muted/50 flex items-center justify-center rounded-lg border p-4', void 0, { 'bg-zinc-900': embedConfig.theme === "dark" })}><!---->`);

										{
											$$renderer.push(`<!---->`);

											{
												$$renderer.push(`<iframe title="Embed preview"${$.attr('src', previewUrl())} width="100%"${$.attr('height', embedConfig.embedType === "status"
													? 70
													: embedConfig.embedType === "events" ? 300 : embedConfig.height + 50)} frameborder="0" class="rounded"></iframe>`);
											}

											$$renderer.push(`<!---->`);
										}

										$$renderer.push(`<!----></div> <div class="space-y-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Embed URL`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="flex gap-2">`);

										Input($$renderer, {
											readonly: true,
											value: previewUrl(),
											class: 'font-mono text-xs'
										});

										$$renderer.push(`<!----> `);

										CopyButton($$renderer, {
											variant: 'outline',
											size: 'icon',
											text: previewUrl(),
											children: ($$renderer) => {
												CopyIcon($$renderer, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div></div> <div class="space-y-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Embed Code`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="flex gap-2">`);

										Input($$renderer, {
											readonly: true,
											value: htmlSnippet(),
											class: 'font-mono text-xs'
										});

										$$renderer.push(`<!----> `);

										CopyButton($$renderer, {
											variant: 'outline',
											size: 'icon',
											text: htmlSnippet(),
											children: ($$renderer) => {
												CopyIcon($$renderer, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div></div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="text-muted-foreground flex items-center justify-center py-12 text-center">Select a monitor to preview the embed</div>`);
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
	});
}