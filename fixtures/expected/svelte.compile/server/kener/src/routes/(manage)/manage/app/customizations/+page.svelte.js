import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import Loader from "@lucide/svelte/icons/loader";
import Info from "@lucide/svelte/icons/info";
import { toast } from "svelte-sonner";
import { mode } from "mode-watcher";
import constants from "$lib/global-constants";
import CodeMirror from "svelte-codemirror-editor";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import ColorPicker from "svelte-awesome-color-picker";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import ArrowDown from "@lucide/svelte/icons/arrow-down";
import GripVertical from "@lucide/svelte/icons/grip-vertical";
import { onMount } from "svelte";
import { Spinner } from "$lib/components/ui/spinner";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// State
		let loading = true;

		let savingFooter = false;
		let savingColors = false;
		let savingFont = false;
		let savingCSS = false;
		let savingTheme = false;
		let savingAnnouncement = false;
		let savingPageOrdering = false;
		let loadingPages = false;

		// Data
		let footerHTML = "";

		let defaultFooterHTML = "";
		let theme = "system";
		let themeToggle = "YES";

		let colors = {
			UP: "#67ab95",
			DOWN: "#ca3038",
			DEGRADED: "#e6ca61",
			MAINTENANCE: "#6679cc",
			ACCENT: "#f4f4f5",
			ACCENT_FOREGROUND: "#e96e2d"
		};

		let colorsDark = {
			UP: "#67ab95",
			DOWN: "#ca3038",
			DEGRADED: "#e6ca61",
			MAINTENANCE: "#6679cc",
			ACCENT: "#27272a",
			ACCENT_FOREGROUND: "#e96e2d"
		};

		let font = { cssSrc: "", family: "" };
		let customCSS = "";

		let announcement = {
			title: "",
			message: "",
			type: "INFO",
			reshowAfterInHours: "",
			cancellable: true,
			ctaURL: "",
			ctaText: ""
		};

		// Page ordering
		let pageOrderingEnabled = false;

		let orderedPageIds = [];
		let allPages = [];

		let displayPages = $.derived(() => {
			if (orderedPageIds.length === 0) {
				return allPages;
			}

			const ordered = [];

			for (const id of orderedPageIds) {
				const page = allPages.find((p) => p.id === id);

				if (page) ordered.push(page);
			}

			// Append pages not in the order list (newly added)
			for (const page of allPages) {
				if (!orderedPageIds.includes(page.id)) {
					ordered.push(page);
				}
			}

			return ordered;
		});

		async function fetchSettings() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getAllSiteData" })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					if (result.footerHTML) {
						footerHTML = result.footerHTML;
					}

					if (result.colors) {
						colors = {
							UP: result.colors.UP || "#67ab95",
							DOWN: result.colors.DOWN || "#ca3038",
							DEGRADED: result.colors.DEGRADED || "#e6ca61",
							MAINTENANCE: result.colors.MAINTENANCE || "#6679cc",
							ACCENT: result.colors.ACCENT || "#f4f4f5",
							ACCENT_FOREGROUND: result.colors.ACCENT_FOREGROUND || result.colors.ACCENT || "#e96e2d"
						};
					}

					if (result.colorsDark) {
						colorsDark = {
							UP: result.colorsDark.UP || colors.UP,
							DOWN: result.colorsDark.DOWN || colors.DOWN,
							DEGRADED: result.colorsDark.DEGRADED || colors.DEGRADED,
							MAINTENANCE: result.colorsDark.MAINTENANCE || colors.MAINTENANCE,
							ACCENT: result.colorsDark.ACCENT || "#27272a",
							ACCENT_FOREGROUND: result.colorsDark.ACCENT_FOREGROUND || result.colorsDark.ACCENT || colors.ACCENT_FOREGROUND
						};
					} else {
						colorsDark = { ...colors, ACCENT: "#27272a" };
					}

					if (result.font) {
						font = {
							cssSrc: result.font.cssSrc || "",
							family: result.font.family || ""
						};
					}

					if (result.customCSS) {
						customCSS = result.customCSS;
					}

					if (result.theme) {
						theme = result.theme;
					}

					if (result.themeToggle) {
						themeToggle = result.themeToggle;
					}

					if (result.announcement) {
						announcement = {
							title: result.announcement.title || "",
							message: result.announcement.message || "",
							type: result.announcement.type || "INFO",
							reshowAfterInHours: result.announcement.reshowAfterInHours === null || result.announcement.reshowAfterInHours === undefined ? "" : String(result.announcement.reshowAfterInHours),
							cancellable: result.announcement.cancellable ?? true,
							ctaURL: result.announcement.ctaURL || "",
							ctaText: result.announcement.ctaText || ""
						};
					}

					if (result.pageOrderingSettings) {
						pageOrderingEnabled = result.pageOrderingSettings.enabled ?? false;
						orderedPageIds = result.pageOrderingSettings.order ?? [];
					}
				}

				// Set default footer HTML
				defaultFooterHTML = `<div class="container relative mt-4 max-w-[655px]">
  <div class="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
    <p class="text-center text-sm leading-loose text-muted-foreground">
      Made using 
      <a href="https://github.com/rajnandan1/kener" target="_blank" class="font-medium underline underline-offset-4">
        Kener
      </a>
      an open source status page system built with Svelte and TailwindCSS.
    </p>
  </div>
</div>`;
			} catch(e) {
				toast.error("Failed to load settings");
			} finally {
				loading = false;
			}
		}

		// Save functions for each section
		async function saveFooter() {
			savingFooter = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeSiteData", data: { footerHTML } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Footer saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save footer");
			} finally {
				savingFooter = false;
			}
		}

		async function saveColors() {
			savingColors = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: {
							colors: JSON.stringify(colors),
							colorsDark: JSON.stringify(colorsDark)
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Status colors saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save colors");
			} finally {
				savingColors = false;
			}
		}

		async function saveFont() {
			savingFont = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { font: JSON.stringify(font) }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Font settings saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save font settings");
			} finally {
				savingFont = false;
			}
		}

		async function saveCustomCSS() {
			savingCSS = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeSiteData", data: { customCSS } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Custom CSS saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save custom CSS");
			} finally {
				savingCSS = false;
			}
		}

		async function saveTheme() {
			savingTheme = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeSiteData", data: { theme, themeToggle } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Theme settings saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save theme settings");
			} finally {
				savingTheme = false;
			}
		}

		async function saveAnnouncement() {
			savingAnnouncement = true;

			try {
				const rawReshow = announcement.reshowAfterInHours;
				const parsedReshow = rawReshow == null ? "" : String(rawReshow).trim();
				const reshowAfterInHours = parsedReshow.length === 0 ? null : Math.max(0, Number(parsedReshow));

				const payload = {
					title: announcement.title.trim(),
					message: announcement.message.trim(),
					type: announcement.type,
					reshowAfterInHours: Number.isFinite(reshowAfterInHours) ? reshowAfterInHours : null,
					cancellable: announcement.cancellable,
					ctaURL: announcement.ctaURL.trim() ? announcement.ctaURL.trim() : null,
					ctaText: announcement.ctaText.trim() ? announcement.ctaText.trim() : null
				};

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { announcement: JSON.stringify(payload) }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					announcement.reshowAfterInHours = reshowAfterInHours == null ? "" : String(reshowAfterInHours);
					toast.success("Announcement settings saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save announcement settings");
			} finally {
				savingAnnouncement = false;
			}
		}

		async function fetchPages() {
			loadingPages = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getPages" })
				});

				const result = await response.json();

				if (Array.isArray(result)) {
					allPages = result.map((p) => ({ id: p.id, page_path: p.page_path, page_title: p.page_title }));
				}
			} catch {
				// silently fail
			} finally {
				loadingPages = false;
			}
		}

		async function savePageOrdering() {
			savingPageOrdering = true;

			try {
				const payload = {
					enabled: pageOrderingEnabled,
					order: displayPages().map((p) => p.id)
				};

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { pageOrderingSettings: JSON.stringify(payload) }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					orderedPageIds = displayPages().map((p) => p.id);
					toast.success("Page ordering saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save page ordering");
			} finally {
				savingPageOrdering = false;
			}
		}

		function movePageUp(index) {
			if (index <= 0) return;

			const pages = displayPages().map((p) => p.id);

			[pages[index - 1], pages[index]] = [pages[index], pages[index - 1]];
			orderedPageIds = pages;
		}

		function movePageDown(index) {
			const pages = displayPages().map((p) => p.id);

			if (index >= pages.length - 1) return;

			[pages[index], pages[index + 1]] = [pages[index + 1], pages[index]];
			orderedPageIds = pages;
		}

		function resetFooter() {
			footerHTML = defaultFooterHTML;
		}

		// Initialize on mount
		onMount(() => {
			fetchSettings();
			fetchPages();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-6 overflow-hidden">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
				Spinner($$renderer, { class: 'h-6 w-6' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'border-b',
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Site Footer`);
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
													$$renderer.push(`<!---->Customize the footer HTML of your status page. Use HTML to add links, text, and other content.`);
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
									class: 'pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="w-full"><div class="overflow-hidden rounded-md border">`);

										CodeMirror($$renderer, {
											lang: html(),
											theme: mode.current === "dark" ? githubDark : githubLight,
											styles: { "&": { width: "100%", maxWidth: "100%", height: "320px" } },
											get value() {
												return footerHTML;
											},

											set value($$value) {
												footerHTML = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div></div>`);
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
									class: 'flex justify-between border-t pt-6',
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											onclick: resetFooter,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Reset to Default`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											onclick: saveFooter,
											disabled: savingFooter,
											children: ($$renderer) => {
												if (savingFooter) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> Save Footer`);
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

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'border-b',
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Status Colors`);
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
													$$renderer.push(`<!---->Customize the colors used to represent different monitor statuses. Set separate colors for light and dark
          themes.`);
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
									class: 'pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="ktable rounded-lg border">`);

										if (Table.Root) {
											$$renderer.push('<!--[-->');

											Table.Root($$renderer, {
												children: ($$renderer) => {
													if (Table.Header) {
														$$renderer.push('<!--[-->');

														Table.Header($$renderer, {
															children: ($$renderer) => {
																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Head) {
																				$$renderer.push('<!--[-->');

																				Table.Head($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Name`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Head) {
																				$$renderer.push('<!--[-->');

																				Table.Head($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Light`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Head) {
																				$$renderer.push('<!--[-->');

																				Table.Head($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Dark`);
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

													if (Table.Body) {
														$$renderer.push('<!--[-->');

														Table.Body($$renderer, {
															children: ($$renderer) => {
																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					class: 'font-medium',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(constants.UP)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colors.UP;
																								},

																								set hex($$value) {
																									colors.UP = $$value;
																									$$settled = false;
																								}
																							});
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colorsDark.UP;
																								},

																								set hex($$value) {
																									colorsDark.UP = $$value;
																									$$settled = false;
																								}
																							});
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

																$$renderer.push(` `);

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					class: 'font-medium',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(constants.DEGRADED)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colors.DEGRADED;
																								},

																								set hex($$value) {
																									colors.DEGRADED = $$value;
																									$$settled = false;
																								}
																							});
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colorsDark.DEGRADED;
																								},

																								set hex($$value) {
																									colorsDark.DEGRADED = $$value;
																									$$settled = false;
																								}
																							});
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

																$$renderer.push(` `);

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					class: 'font-medium',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(constants.DOWN)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colors.DOWN;
																								},

																								set hex($$value) {
																									colors.DOWN = $$value;
																									$$settled = false;
																								}
																							});
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colorsDark.DOWN;
																								},

																								set hex($$value) {
																									colorsDark.DOWN = $$value;
																									$$settled = false;
																								}
																							});
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

																$$renderer.push(` `);

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					class: 'font-medium',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(constants.MAINTENANCE)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colors.MAINTENANCE;
																								},

																								set hex($$value) {
																									colors.MAINTENANCE = $$value;
																									$$settled = false;
																								}
																							});
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colorsDark.MAINTENANCE;
																								},

																								set hex($$value) {
																									colorsDark.MAINTENANCE = $$value;
																									$$settled = false;
																								}
																							});
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

																$$renderer.push(` `);

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					class: 'font-medium',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Accent`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colors.ACCENT;
																								},

																								set hex($$value) {
																									colors.ACCENT = $$value;
																									$$settled = false;
																								}
																							});
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colorsDark.ACCENT;
																								},

																								set hex($$value) {
																									colorsDark.ACCENT = $$value;
																									$$settled = false;
																								}
																							});
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

																$$renderer.push(` `);

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					class: 'font-medium',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Accent Foreground`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colors.ACCENT_FOREGROUND;
																								},

																								set hex($$value) {
																									colors.ACCENT_FOREGROUND = $$value;
																									$$settled = false;
																								}
																							});
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

																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					children: ($$renderer) => {
																						$.css_props($$renderer, true, { '--input-size': '16px' }, () => {
																							ColorPicker($$renderer, {
																								position: 'responsive',
																								isAlpha: false,
																								isDark: mode.current === "dark",
																								isTextInput: true,
																								label: '',
																								get hex() {
																									return colorsDark.ACCENT_FOREGROUND;
																								},

																								set hex($$value) {
																									colorsDark.ACCENT_FOREGROUND = $$value;
																									$$settled = false;
																								}
																							});
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
									class: 'flex justify-end border-t pt-6',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveColors,
											disabled: savingColors,
											children: ($$renderer) => {
												if (savingColors) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> Save Colors`);
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

				$$renderer.push(` `);

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'border-b',
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												class: 'flex items-center gap-2',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Font `);

													if (Tooltip.Root) {
														$$renderer.push('<!--[-->');

														Tooltip.Root($$renderer, {
															children: ($$renderer) => {
																if (Tooltip.Trigger) {
																	$$renderer.push('<!--[-->');

																	Tooltip.Trigger($$renderer, {
																		children: ($$renderer) => {
																			Info($$renderer, { class: 'text-muted-foreground h-4 w-4' });
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Tooltip.Content) {
																	$$renderer.push('<!--[-->');

																	Tooltip.Content($$renderer, {
																		class: 'max-w-xs',
																		children: ($$renderer) => {
																			$$renderer.push(`<p>You can use any web font by providing the CSS URL and font family name. Popular sources include Google
                Fonts and Bunny Fonts.</p>`);
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

										if (Card.Description) {
											$$renderer.push('<!--[-->');

											Card.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Customize the font used throughout your status page.`);
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
									class: 'pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="grid gap-4 md:grid-cols-2"><div>`);

										Label($$renderer, {
											for: 'font-url',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Font CSS URL`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											type: 'text',
											id: 'font-url',
											placeholder: 'https://fonts.bunny.net/css?family=lato:400,700&display=swap',
											class: 'mt-1',
											get value() {
												return font.cssSrc;
											},

											set value($$value) {
												font.cssSrc = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground mt-1 text-xs">The URL to the CSS file that loads the font</p></div> <div>`);

										Label($$renderer, {
											for: 'font-family',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Font Family Name`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											type: 'text',
											id: 'font-family',
											placeholder: 'Lato',
											class: 'mt-1',
											get value() {
												return font.family;
											},

											set value($$value) {
												font.family = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground mt-1 text-xs">The name of the font family as defined in the CSS</p></div></div> <p class="text-muted-foreground mt-4 text-sm">Want to upload and use custom fonts? Read more about it in the <a href="https://kener.ing/docs/v4/guides/custom-fonts" target="_blank" class="text-foreground underline underline-offset-4">documentation</a>.</p>`);
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
									class: 'flex justify-end border-t pt-6',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveFont,
											disabled: savingFont,
											children: ($$renderer) => {
												if (savingFont) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> Save Font`);
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

				$$renderer.push(` `);

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'border-b',
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Theme`);
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
													$$renderer.push(`<!---->Configure the default theme and user preferences for your status page.`);
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
									class: 'space-y-6 pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="space-y-3">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Default Theme`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (RadioGroup.Root) {
											$$renderer.push('<!--[-->');

											RadioGroup.Root($$renderer, {
												class: 'flex flex-col gap-3',
												get value() {
													return theme;
												},

												set value($$value) {
													theme = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'light', id: 'theme-light' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'theme-light',
														class: 'cursor-pointer font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Light`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'dark', id: 'theme-dark' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'theme-dark',
														class: 'cursor-pointer font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Dark`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'system', id: 'theme-system' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'theme-system',
														class: 'cursor-pointer font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->System`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <p class="text-muted-foreground text-xs">The theme that will be used by default when users visit your status page.</p></div> <div class="flex items-start space-x-3 rounded-lg border p-4">`);

										Checkbox($$renderer, {
											id: 'theme-toggle',
											checked: themeToggle === "YES",
											onCheckedChange: (checked) => themeToggle = checked ? "YES" : "NO"
										});

										$$renderer.push(`<!----> <div class="space-y-1">`);

										Label($$renderer, {
											for: 'theme-toggle',
											class: 'cursor-pointer',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Allow users to toggle theme`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">When enabled, users can switch between light and dark themes using a toggle button.</p></div></div>`);
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
									class: 'flex justify-end border-t pt-6',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveTheme,
											disabled: savingTheme,
											children: ($$renderer) => {
												if (savingTheme) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> Save Theme`);
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

				$$renderer.push(` `);

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'border-b',
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Announcement`);
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
													$$renderer.push(`<!---->Configure a site-wide announcement message shown to visitors.`);
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
									class: 'space-y-4 pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="grid gap-4 md:grid-cols-2"><div class="space-y-2">`);

										Label($$renderer, {
											for: 'announcement-title',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Title`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'announcement-title',
											placeholder: 'Scheduled Maintenance',
											get value() {
												return announcement.title;
											},

											set value($$value) {
												announcement.title = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'announcement-type',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Type`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: announcement.type,
												onValueChange: (v) => v && (announcement.type = v),
												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															id: 'announcement-type',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(announcement.type)}`);
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
																		value: 'INFO',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->INFO`);
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
																		value: 'WARNING',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->WARNING`);
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
																		value: 'ERROR',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->ERROR`);
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

										$$renderer.push(`</div></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'announcement-message',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Message`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Textarea($$renderer, {
											id: 'announcement-message',
											placeholder: 'We are currently performing infrastructure upgrades.',
											rows: 4,
											get value() {
												return announcement.message;
											},

											set value($$value) {
												announcement.message = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="grid gap-4 md:grid-cols-3"><div class="space-y-2">`);

										Label($$renderer, {
											for: 'announcement-reshow',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Reshow After (hours)`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'announcement-reshow',
											type: 'number',
											min: '0',
											placeholder: 'Leave empty to never reshow automatically',
											get value() {
												return announcement.reshowAfterInHours;
											},

											set value($$value) {
												announcement.reshowAfterInHours = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Leave empty for null.</p></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'announcement-cta',
											children: ($$renderer) => {
												$$renderer.push(`<!---->CTA URL (optional)`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'announcement-cta-url',
											placeholder: 'https://status.example.com/incident/123',
											get value() {
												return announcement.ctaURL;
											},

											set value($$value) {
												announcement.ctaURL = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'announcement-cta-text',
											children: ($$renderer) => {
												$$renderer.push(`<!---->CTA Text (optional)`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'announcement-cta-text',
											placeholder: 'Learn more',
											get value() {
												return announcement.ctaText;
											},

											set value($$value) {
												announcement.ctaText = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div></div> <div class="flex items-start space-x-3 rounded-lg border p-4">`);

										Checkbox($$renderer, {
											id: 'announcement-cancellable',
											checked: announcement.cancellable,
											onCheckedChange: (checked) => announcement.cancellable = checked === true
										});

										$$renderer.push(`<!----> <div class="space-y-1">`);

										Label($$renderer, {
											for: 'announcement-cancellable',
											class: 'cursor-pointer',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancellable`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Allow users to dismiss the announcement.</p></div></div>`);
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
									class: 'flex justify-end border-t pt-6',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveAnnouncement,
											disabled: savingAnnouncement,
											children: ($$renderer) => {
												if (savingAnnouncement) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> Save Announcement`);
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

				$$renderer.push(` `);

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'border-b',
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Page Ordering`);
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
													$$renderer.push(`<!---->Control the display order of pages in the page switcher. New pages will appear at the end of the list.`);
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
									class: 'space-y-4 pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-start space-x-3 rounded-lg border p-4">`);

										Checkbox($$renderer, {
											id: 'page-ordering-enabled',
											checked: pageOrderingEnabled,
											onCheckedChange: (checked) => pageOrderingEnabled = checked === true
										});

										$$renderer.push(`<!----> <div class="space-y-1">`);

										Label($$renderer, {
											for: 'page-ordering-enabled',
											class: 'cursor-pointer',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Enable custom page ordering`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">When enabled, pages will be displayed in the order below instead of the default creation order.</p></div></div> `);

										if (loadingPages) {
											$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-6">`);
											Spinner($$renderer, { class: 'h-5 w-5' });
											$$renderer.push(`<!----></div>`);
										} else if (allPages.length === 0) {
											$$renderer.push(`<!--[1--><p class="text-muted-foreground py-4 text-center text-sm">No pages found.</p>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="rounded-lg border"><!--[-->`);

											const each_array = $.ensure_array_like(displayPages());

											for (let index = 0, $$length = each_array.length; index < $$length; index++) {
												let page = each_array[index];

												$$renderer.push(`<div${$.attr_class(`flex items-center justify-between px-4 py-3 ${index < displayPages().length - 1 ? 'border-b' : ''}`)}><div class="flex items-center gap-3">`);
												GripVertical($$renderer, { class: 'text-muted-foreground h-4 w-4 shrink-0' });
												$$renderer.push(`<!----> <div><p class="text-sm font-medium">${$.escape(page.page_title)}</p> <p class="text-muted-foreground text-xs">/${$.escape(page.page_path || "")}</p></div></div> `);

												if (pageOrderingEnabled) {
													$$renderer.push(`<!--[0--><div class="flex items-center gap-1">`);

													Button($$renderer, {
														variant: 'ghost',
														size: 'icon',
														class: 'h-8 w-8',
														disabled: index === 0,
														onclick: () => movePageUp(index),
														children: ($$renderer) => {
															ArrowUp($$renderer, { class: 'h-4 w-4' });
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'ghost',
														size: 'icon',
														class: 'h-8 w-8',
														disabled: index === displayPages().length - 1,
														onclick: () => movePageDown(index),
														children: ($$renderer) => {
															ArrowDown($$renderer, { class: 'h-4 w-4' });
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></div>`);
											}

											$$renderer.push(`<!--]--></div>`);
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
									class: 'flex justify-end border-t pt-6',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: savePageOrdering,
											disabled: savingPageOrdering || loadingPages,
											children: ($$renderer) => {
												if (savingPageOrdering) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> Save Page Ordering`);
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

				$$renderer.push(` `);

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'border-b',
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Custom CSS`);
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
													$$renderer.push(`<!---->Add custom CSS to further customize the appearance of your status page. Do not include &lt;style> tags.
          Learn more in the <a href="https://kener.ing/docs/v4/guides/custom-js-css-guide" target="_blank" class="text-foreground underline underline-offset-4">documentation</a>.`);
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
									class: 'pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="w-full"><div class="overflow-hidden rounded-md border">`);

										CodeMirror($$renderer, {
											lang: css(),
											theme: mode.current === "dark" ? githubDark : githubLight,
											styles: { "&": { width: "100%", maxWidth: "100%", height: "320px" } },
											get value() {
												return customCSS;
											},

											set value($$value) {
												customCSS = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div></div>`);
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
									class: 'flex justify-end border-t pt-6',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveCustomCSS,
											disabled: savingCSS,
											children: ($$renderer) => {
												if (savingCSS) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> Save Custom CSS`);
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