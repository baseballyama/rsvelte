import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import GlobeIcon from "@lucide/svelte/icons/globe";
import ClockIcon from "@lucide/svelte/icons/clock";
import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
import { toast } from "svelte-sonner";
import { availableLocalesList } from "$lib/stores/i18n";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { format } from "date-fns";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// State
		let loading = true;

		let savingLanguages = false;
		let savingTimezone = false;
		let savingDateTimeFormat = false;
		let tzToggle = "NO";
		let dateAndTimeFormat = { datePlusTime: "PPpp", dateOnly: "PP", timeOnly: "pp" };

		let i18n = {
			defaultLocale: "en",
			locales: availableLocalesList.map((el) => ({
				code: el.code,
				name: el.name,
				selected: el.code === "en",
				disabled: false
			}))
		};

		// Computed: available locales for default selection (only selected ones)
		const availableDefaultLocales = $.derived(() => i18n.locales.filter((locale) => locale.selected));

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
					if (result.tzToggle) {
						tzToggle = result.tzToggle;
					}

					if (result.dateAndTimeFormat) {
						dateAndTimeFormat = {
							datePlusTime: result.dateAndTimeFormat.datePlusTime || "PPpp",
							dateOnly: result.dateAndTimeFormat.dateOnly || "PP",
							timeOnly: result.dateAndTimeFormat.timeOnly || "pp"
						};
					}

					if (result.i18n) {
						// Merge with all available locales
						const existingLocales = result.i18n.locales || [];

						i18n = {
							defaultLocale: result.i18n.defaultLocale || "en",
							locales: availableLocalesList.map((el) => {
								const existing = existingLocales.find((l) => l.code === el.code);

								return {
									code: el.code,
									name: el.name,
									selected: existing ? existing.selected : false,
									disabled: false
								};
							})
						};
					}
				}
			} catch(e) {
				toast.error("Failed to load settings");
			} finally {
				loading = false;
			}
		}

		async function saveLanguages() {
			savingLanguages = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { i18n: JSON.stringify(i18n) }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Language settings saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save language settings");
			} finally {
				savingLanguages = false;
			}
		}

		async function saveTimezone() {
			savingTimezone = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeSiteData", data: { tzToggle } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Timezone settings saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save timezone settings");
			} finally {
				savingTimezone = false;
			}
		}

		function toggleLocale(code, checked) {
			const locale = i18n.locales.find((l) => l.code === code);

			if (locale) {
				locale.selected = checked;

				// If this was the default locale and it's being unchecked, reset default
				if (!checked && i18n.defaultLocale === code) {
					const firstSelected = i18n.locales.find((l) => l.selected);

					if (firstSelected) {
						i18n.defaultLocale = firstSelected.code;
					}
				}

				i18n = { ...i18n };
			}
		}

		function setDefaultLocale(code) {
			i18n.defaultLocale = code;
		}

		const previewDate = new Date();

		const datePlusTimeSuggestions = [
			{ value: "PPp", label: "Locale (AM/PM)" },
			{ value: "PP HH:mm", label: "Locale date + 24h" },
			{ value: "yyyy-MM-dd HH:mm", label: "ISO-like 24h" },
			{ value: "dd MMM yyyy h:mm a", label: "Day month year AM/PM" },
			{ value: "MMM dd, yyyy HH:mm", label: "Month day year 24h" }
		];

		const dateOnlySuggestions = [
			{ value: "PP", label: "Locale" },
			{ value: "yyyy-MM-dd", label: "ISO" },
			{ value: "dd/MM/yyyy", label: "Day-first" },
			{ value: "MMM dd, yyyy", label: "Month day year" },
			{ value: "dd MMM yyyy", label: "Day month year" }
		];

		const timeOnlySuggestions = [
			{ value: "p", label: "Locale (AM/PM)" },
			{ value: "HH:mm", label: "24h" },
			{ value: "H:mm", label: "24h short" },
			{ value: "h:mm a", label: "12h AM/PM" },
			{ value: "hh:mm", label: "12h no period" }
		];

		function formatPreview(fmt) {
			try {
				return format(previewDate, fmt);
			} catch {
				return "Invalid format";
			}
		}

		async function saveDateTimeFormat() {
			savingDateTimeFormat = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { dateAndTimeFormat: JSON.stringify(dateAndTimeFormat) }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Date & time format saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save date & time format");
			} finally {
				savingDateTimeFormat = false;
			}
		}

		$$renderer.push(`<div class="flex w-full flex-col gap-4 p-4">`);

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
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center gap-2">`);
									GlobeIcon($$renderer, { class: 'h-5 w-5' });
									$$renderer.push(`<!----> <div>`);

									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Languages`);
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
												$$renderer.push(`<!---->Configure the available languages for your status page`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div></div>`);
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
								class: 'space-y-6',
								children: ($$renderer) => {
									$$renderer.push(`<div class="space-y-3">`);

									Label($$renderer, {
										class: 'text-sm font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Available Languages`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Select the languages you want to make available on your status page. Users will be able to switch between
            these languages.</p> <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"><!--[-->`);

									const each_array = $.ensure_array_like(i18n.locales);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let locale = each_array[$$index];

										$$renderer.push(`<div class="flex items-center space-x-2">`);

										Checkbox($$renderer, {
											id: `locale-${$.stringify(locale.code)}`,
											checked: locale.selected,
											disabled: i18n.defaultLocale === locale.code,
											onCheckedChange: (checked) => toggleLocale(locale.code, checked === true)
										});

										$$renderer.push(`<!----> `);

										Label($$renderer, {
											for: `locale-${$.stringify(locale.code)}`,
											class: `text-sm font-normal ${i18n.defaultLocale === locale.code ? 'text-muted-foreground' : ''}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(locale.name)} `);

												if (i18n.defaultLocale === locale.code) {
													$$renderer.push(`<!--[0--><span class="text-muted-foreground text-xs">(default)</span>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}

									$$renderer.push(`<!--]--></div></div> <div class="space-y-3">`);

									Label($$renderer, {
										class: 'text-sm font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Default Language`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">The default language will be shown when users first visit your status page.</p> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											value: i18n.defaultLocale,
											onValueChange: (v) => {
												if (v) setDefaultLocale(v);
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														class: 'w-[200px]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(i18n.locales.find((l) => l.code === i18n.defaultLocale)?.name || "Select language")}`);
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

															const each_array_1 = $.ensure_array_like(availableDefaultLocales());

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
								class: 'flex justify-end',
								children: ($$renderer) => {
									Button($$renderer, {
										onclick: saveLanguages,
										disabled: savingLanguages,
										children: ($$renderer) => {
											if (savingLanguages) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'h-4 w-4' });
											}

											$$renderer.push(`<!--]--> Save Languages`);
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
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center gap-2">`);
									ClockIcon($$renderer, { class: 'h-5 w-5' });
									$$renderer.push(`<!----> <div>`);

									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Timezone Settings`);
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
												$$renderer.push(`<!---->Configure timezone switching for your status page`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div></div>`);
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
								class: 'space-y-4',
								children: ($$renderer) => {
									$$renderer.push(`<p class="text-muted-foreground text-sm">Kener automatically detects the user's timezone and displays times accordingly. You can optionally allow users
          to manually switch between different timezones.</p> <div class="flex items-center space-x-3">`);

									Switch($$renderer, {
										id: 'tz-toggle',
										checked: tzToggle === "YES",
										onCheckedChange: (checked) => tzToggle = checked ? "YES" : "NO"
									});

									$$renderer.push(`<!----> `);

									Label($$renderer, {
										for: 'tz-toggle',
										class: 'font-normal',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Allow users to switch timezones`);
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

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								class: 'flex justify-end',
								children: ($$renderer) => {
									Button($$renderer, {
										onclick: saveTimezone,
										disabled: savingTimezone,
										children: ($$renderer) => {
											if (savingTimezone) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'h-4 w-4' });
											}

											$$renderer.push(`<!--]--> Save Timezone`);
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
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center gap-2">`);
									CalendarClockIcon($$renderer, { class: 'h-5 w-5' });
									$$renderer.push(`<!----> <div>`);

									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Date &amp; Time Format`);
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
												$$renderer.push(`<!---->Choose how dates and times are displayed across your status page. Uses <a href="https://date-fns.org/docs/format" target="_blank" class="hover:text-foreground underline underline-offset-2">date-fns format tokens</a>.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div></div>`);
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
								class: 'space-y-6',
								children: ($$renderer) => {
									$$renderer.push(`<div class="space-y-2">`);

									Label($$renderer, {
										class: 'text-sm font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Date + Time`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										class: 'font-mono text-sm',
										placeholder: 'e.g. PPpp',
										value: dateAndTimeFormat.datePlusTime,
										oninput: (e) => {
											dateAndTimeFormat.datePlusTime = e.currentTarget.value;
										}
									});

									$$renderer.push(`<!----> <div class="flex flex-wrap items-center gap-1.5"><!--[-->`);

									const each_array_2 = $.ensure_array_like(datePlusTimeSuggestions);

									for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
										let s = each_array_2[$$index_2];

										Badge($$renderer, {
											variant: dateAndTimeFormat.datePlusTime === s.value ? "default" : "outline",
											class: 'cursor-pointer',
											href: undefined,
											onclick: () => {
												dateAndTimeFormat.datePlusTime = s.value;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(s.label)} (${$.escape(s.value)})`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--></div> <p class="text-muted-foreground text-xs">Preview: <code>${$.escape(formatPreview(dateAndTimeFormat.datePlusTime))}</code></p></div> <div class="space-y-2">`);

									Label($$renderer, {
										class: 'text-sm font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Date Only`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										class: 'font-mono text-sm',
										placeholder: 'e.g. PP',
										value: dateAndTimeFormat.dateOnly,
										oninput: (e) => {
											dateAndTimeFormat.dateOnly = e.currentTarget.value;
										}
									});

									$$renderer.push(`<!----> <div class="flex flex-wrap items-center gap-1.5"><!--[-->`);

									const each_array_3 = $.ensure_array_like(dateOnlySuggestions);

									for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
										let s = each_array_3[$$index_3];

										Badge($$renderer, {
											variant: dateAndTimeFormat.dateOnly === s.value ? "default" : "outline",
											class: 'cursor-pointer',
											href: undefined,
											onclick: () => {
												dateAndTimeFormat.dateOnly = s.value;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(s.label)} (${$.escape(s.value)})`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--></div> <p class="text-muted-foreground text-xs">Preview: <code>${$.escape(formatPreview(dateAndTimeFormat.dateOnly))}</code></p></div> <div class="space-y-2">`);

									Label($$renderer, {
										class: 'text-sm font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Time Only`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										class: 'font-mono text-sm',
										placeholder: 'e.g. pp',
										value: dateAndTimeFormat.timeOnly,
										oninput: (e) => {
											dateAndTimeFormat.timeOnly = e.currentTarget.value;
										}
									});

									$$renderer.push(`<!----> <div class="flex flex-wrap items-center gap-1.5"><!--[-->`);

									const each_array_4 = $.ensure_array_like(timeOnlySuggestions);

									for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
										let s = each_array_4[$$index_4];

										Badge($$renderer, {
											variant: dateAndTimeFormat.timeOnly === s.value ? "default" : "outline",
											class: 'cursor-pointer',
											href: undefined,
											onclick: () => {
												dateAndTimeFormat.timeOnly = s.value;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(s.label)} (${$.escape(s.value)})`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--></div> <p class="text-muted-foreground text-xs">Preview: <code>${$.escape(formatPreview(dateAndTimeFormat.timeOnly))}</code></p></div>`);
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
								class: 'flex justify-end',
								children: ($$renderer) => {
									Button($$renderer, {
										onclick: saveDateTimeFormat,
										disabled: savingDateTimeFormat,
										children: ($$renderer) => {
											if (savingDateTimeFormat) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'h-4 w-4' });
											}

											$$renderer.push(`<!--]--> Save Format`);
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
	});
}