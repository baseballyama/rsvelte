import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!> <div><!> <!></div></div>`);
var root_2 = $.from_html(`<span class="text-muted-foreground text-xs">(default)</span>`);
var root_3 = $.from_html(` <!>`, 1);
var root_4 = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);

var root_6 = $.from_html(
	`<div class="space-y-3"><!> <p class="text-muted-foreground text-xs">Select the languages you want to make available on your status page. Users will be able to switch between
            these languages.</p> <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"></div></div> <div class="space-y-3"><!> <p class="text-muted-foreground text-xs">The default language will be shown when users first visit your status page.</p> <!></div>`,
	1
);

var root_7 = $.from_html(`<!> Save Languages`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);

var root_9 = $.from_html(
	`<p class="text-muted-foreground text-sm">Kener automatically detects the user's timezone and displays times accordingly. You can optionally allow users
          to manually switch between different timezones.</p> <div class="flex items-center space-x-3"><!> <!></div>`,
	1
);

var root_10 = $.from_html(`<!> Save Timezone`, 1);
var root_11 = $.from_html(`Choose how dates and times are displayed across your status page. Uses <a href="https://date-fns.org/docs/format" target="_blank" class="hover:text-foreground underline underline-offset-2">date-fns format tokens</a>.`, 1);
var root_12 = $.from_html(`<div class="space-y-2"><!> <!> <div class="flex flex-wrap items-center gap-1.5"></div> <p class="text-muted-foreground text-xs">Preview: <code> </code></p></div> <div class="space-y-2"><!> <!> <div class="flex flex-wrap items-center gap-1.5"></div> <p class="text-muted-foreground text-xs">Preview: <code> </code></p></div> <div class="space-y-2"><!> <!> <div class="flex flex-wrap items-center gap-1.5"></div> <p class="text-muted-foreground text-xs">Preview: <code> </code></p></div>`, 1);
var root_13 = $.from_html(`<!> Save Format`, 1);
var root_14 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// State
	let loading = $.state(true);

	let savingLanguages = $.state(false);
	let savingTimezone = $.state(false);
	let savingDateTimeFormat = $.state(false);
	let tzToggle = $.state("NO");
	let dateAndTimeFormat = $.state($.proxy({ datePlusTime: "PPpp", dateOnly: "PP", timeOnly: "pp" }));

	let i18n = $.state($.proxy({
		defaultLocale: "en",
		locales: availableLocalesList.map((el) => ({
			code: el.code,
			name: el.name,
			selected: el.code === "en",
			disabled: false
		}))
	}));

	// Computed: available locales for default selection (only selected ones)
	const availableDefaultLocales = $.derived(() => $.get(i18n).locales.filter((locale) => locale.selected));

	async function fetchSettings() {
		$.set(loading, true);

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
					$.set(tzToggle, result.tzToggle, true);
				}

				if (result.dateAndTimeFormat) {
					$.set(
						dateAndTimeFormat,
						{
							datePlusTime: result.dateAndTimeFormat.datePlusTime || "PPpp",
							dateOnly: result.dateAndTimeFormat.dateOnly || "PP",
							timeOnly: result.dateAndTimeFormat.timeOnly || "pp"
						},
						true
					);
				}

				if (result.i18n) {
					// Merge with all available locales
					const existingLocales = result.i18n.locales || [];

					$.set(
						i18n,
						{
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
						},
						true
					);
				}
			}
		} catch(e) {
			toast.error("Failed to load settings");
		} finally {
			$.set(loading, false);
		}
	}

	async function saveLanguages() {
		$.set(savingLanguages, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { i18n: JSON.stringify($.get(i18n)) }
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
			$.set(savingLanguages, false);
		}
	}

	async function saveTimezone() {
		$.set(savingTimezone, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "storeSiteData", data: { tzToggle: $.get(tzToggle) } })
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
			$.set(savingTimezone, false);
		}
	}

	function toggleLocale(code, checked) {
		const locale = $.get(i18n).locales.find((l) => l.code === code);

		if (locale) {
			locale.selected = checked;

			// If this was the default locale and it's being unchecked, reset default
			if (!checked && $.get(i18n).defaultLocale === code) {
				const firstSelected = $.get(i18n).locales.find((l) => l.selected);

				if (firstSelected) {
					$.get(i18n).defaultLocale = firstSelected.code;
				}
			}

			$.set(i18n, { ...$.get(i18n) }, true);
		}
	}

	function setDefaultLocale(code) {
		$.get(i18n).defaultLocale = code;
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
		$.set(savingDateTimeFormat, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { dateAndTimeFormat: JSON.stringify($.get(dateAndTimeFormat)) }
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
			$.set(savingDateTimeFormat, false);
		}
	}

	$.user_effect(() => {
		fetchSettings();
	});

	var div = root_14();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, { class: 'h-6 w-6' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_3 = ($$anchor) => {
			var fragment = root_8();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_8();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_2 = root_1();
									var node_4 = $.child(div_2);

									GlobeIcon(node_4, { class: 'h-5 w-5' });

									var div_3 = $.sibling(node_4, 2);
									var node_5 = $.child(div_3);

									$.component(node_5, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Languages');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Configure the available languages for your status page');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_3);
									$.reset(div_2);
									$.append($$anchor, div_2);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_3, 2);

						$.component(node_7, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_6();
									var div_4 = $.first_child(fragment_2);
									var node_8 = $.child(div_4);

									Label(node_8, {
										class: 'text-sm font-medium',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Available Languages');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var div_5 = $.sibling(node_8, 4);

									$.each(div_5, 21, () => $.get(i18n).locales, (locale) => locale.code, ($$anchor, locale) => {
										var div_6 = root_4();
										var node_9 = $.child(div_6);

										{
											let $0 = $.derived(() => $.get(i18n).defaultLocale === $.get(locale).code);

											Checkbox(node_9, {
												get id() {
													return `locale-${$.get(locale).code ?? ''}`;
												},

												get checked() {
													return $.get(locale).selected;
												},

												get disabled() {
													return $.get($0);
												},
												onCheckedChange: (checked) => toggleLocale($.get(locale).code, checked === true)
											});
										}

										var node_10 = $.sibling(node_9, 2);

										{
											let $0 = $.derived(() => $.get(i18n).defaultLocale === $.get(locale).code ? 'text-muted-foreground' : '');

											Label(node_10, {
												get for() {
													return `locale-${$.get(locale).code ?? ''}`;
												},

												get class() {
													return `text-sm font-normal ${$.get($0) ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_3 = root_3();
													var text_3 = $.first_child(fragment_3);
													var node_11 = $.sibling(text_3);

													{
														var consequent_1 = ($$anchor) => {
															var span = root_2();

															$.append($$anchor, span);
														};

														$.if(node_11, ($$render) => {
															if ($.get(i18n).defaultLocale === $.get(locale).code) $$render(consequent_1);
														});
													}

													$.template_effect(() => $.set_text(text_3, `${$.get(locale).name ?? ''} `));
													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										}

										$.reset(div_6);
										$.append($$anchor, div_6);
									});

									$.reset(div_5);
									$.reset(div_4);

									var div_7 = $.sibling(div_4, 2);
									var node_12 = $.child(div_7);

									Label(node_12, {
										class: 'text-sm font-medium',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Default Language');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_12, 4);

									$.component(node_13, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(i18n).defaultLocale;
											},

											onValueChange: (v) => {
												if (v) setDefaultLocale(v);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_5();
												var node_14 = $.first_child(fragment_4);

												$.component(node_14, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														class: 'w-[200px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text();

															$.template_effect(($0) => $.set_text(text_5, $0), [
																() => $.get(i18n).locales.find((l) => l.code === $.get(i18n).defaultLocale)?.name || "Select language"
															]);

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = $.comment();
															var node_16 = $.first_child(fragment_6);

															$.each(node_16, 17, () => $.get(availableDefaultLocales), (locale) => locale.code, ($$anchor, locale) => {
																var fragment_7 = $.comment();
																var node_17 = $.first_child(fragment_7);

																$.component(node_17, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		get value() {
																			return $.get(locale).code;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text();

																			$.template_effect(() => $.set_text(text_6, $.get(locale).name));
																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_7);
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_7);
									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_7, 2);

						$.component(node_18, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveLanguages,
										get disabled() {
											return $.get(savingLanguages);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_7();
											var node_19 = $.first_child(fragment_10);

											{
												var consequent_2 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												var alternate = ($$anchor) => {
													SaveIcon($$anchor, { class: 'h-4 w-4' });
												};

												$.if(node_19, ($$render) => {
													if ($.get(savingLanguages)) $$render(consequent_2); else $$render(alternate, -1);
												});
											}

											$.next();
											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_20 = $.sibling(node_2, 2);

			$.component(node_20, () => Card.Root, ($$anchor, Card_Root_1) => {
				Card_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = root_8();
						var node_21 = $.first_child(fragment_13);

						$.component(node_21, () => Card.Header, ($$anchor, Card_Header_1) => {
							Card_Header_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_8 = root_1();
									var node_22 = $.child(div_8);

									ClockIcon(node_22, { class: 'h-5 w-5' });

									var div_9 = $.sibling(node_22, 2);
									var node_23 = $.child(div_9);

									$.component(node_23, () => Card.Title, ($$anchor, Card_Title_1) => {
										Card_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Timezone Settings');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_24 = $.sibling(node_23, 2);

									$.component(node_24, () => Card.Description, ($$anchor, Card_Description_1) => {
										Card_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Configure timezone switching for your status page');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_9);
									$.reset(div_8);
									$.append($$anchor, div_8);
								},
								$$slots: { default: true }
							});
						});

						var node_25 = $.sibling(node_21, 2);

						$.component(node_25, () => Card.Content, ($$anchor, Card_Content_1) => {
							Card_Content_1($$anchor, {
								class: 'space-y-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_9();
									var div_10 = $.sibling($.first_child(fragment_14), 2);
									var node_26 = $.child(div_10);

									{
										let $0 = $.derived(() => $.get(tzToggle) === "YES");

										Switch(node_26, {
											id: 'tz-toggle',
											get checked() {
												return $.get($0);
											},
											onCheckedChange: (checked) => $.set(tzToggle, checked ? "YES" : "NO", true)
										});
									}

									var node_27 = $.sibling(node_26, 2);

									Label(node_27, {
										for: 'tz-toggle',
										class: 'font-normal',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Allow users to switch timezones');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									$.reset(div_10);
									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_28 = $.sibling(node_25, 2);

						$.component(node_28, () => Card.Footer, ($$anchor, Card_Footer_1) => {
							Card_Footer_1($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveTimezone,
										get disabled() {
											return $.get(savingTimezone);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_16 = root_10();
											var node_29 = $.first_child(fragment_16);

											{
												var consequent_3 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												var alternate_1 = ($$anchor) => {
													SaveIcon($$anchor, { class: 'h-4 w-4' });
												};

												$.if(node_29, ($$render) => {
													if ($.get(savingTimezone)) $$render(consequent_3); else $$render(alternate_1, -1);
												});
											}

											$.next();
											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			});

			var node_30 = $.sibling(node_20, 2);

			$.component(node_30, () => Card.Root, ($$anchor, Card_Root_2) => {
				Card_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_19 = root_8();
						var node_31 = $.first_child(fragment_19);

						$.component(node_31, () => Card.Header, ($$anchor, Card_Header_2) => {
							Card_Header_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_11 = root_1();
									var node_32 = $.child(div_11);

									CalendarClockIcon(node_32, { class: 'h-5 w-5' });

									var div_12 = $.sibling(node_32, 2);
									var node_33 = $.child(div_12);

									$.component(node_33, () => Card.Title, ($$anchor, Card_Title_2) => {
										Card_Title_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Date & Time Format');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									var node_34 = $.sibling(node_33, 2);

									$.component(node_34, () => Card.Description, ($$anchor, Card_Description_2) => {
										Card_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_20 = root_11();

												$.next(2);
												$.append($$anchor, fragment_20);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_12);
									$.reset(div_11);
									$.append($$anchor, div_11);
								},
								$$slots: { default: true }
							});
						});

						var node_35 = $.sibling(node_31, 2);

						$.component(node_35, () => Card.Content, ($$anchor, Card_Content_2) => {
							Card_Content_2($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_21 = root_12();
									var div_13 = $.first_child(fragment_21);
									var node_36 = $.child(div_13);

									Label(node_36, {
										class: 'text-sm font-medium',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('Date + Time');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									var node_37 = $.sibling(node_36, 2);

									Input(node_37, {
										class: 'font-mono text-sm',
										placeholder: 'e.g. PPpp',
										get value() {
											return $.get(dateAndTimeFormat).datePlusTime;
										},

										oninput: (e) => {
											$.get(dateAndTimeFormat).datePlusTime = e.currentTarget.value;
										}
									});

									var div_14 = $.sibling(node_37, 2);

									$.each(div_14, 21, () => datePlusTimeSuggestions, (s) => s.value, ($$anchor, s) => {
										{
											let $0 = $.derived(() => $.get(dateAndTimeFormat).datePlusTime === $.get(s).value ? "default" : "outline");

											Badge($$anchor, {
												get variant() {
													return $.get($0);
												},
												class: 'cursor-pointer',
												href: undefined,
												onclick: () => {
													$.get(dateAndTimeFormat).datePlusTime = $.get(s).value;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_12 = $.text();

													$.template_effect(() => $.set_text(text_12, `${$.get(s).label ?? ''} (${$.get(s).value ?? ''})`));
													$.append($$anchor, text_12);
												},
												$$slots: { default: true }
											});
										}
									});

									$.reset(div_14);

									var p = $.sibling(div_14, 2);
									var code_1 = $.sibling($.child(p));
									var text_13 = $.only_child(code_1, true);

									$.reset(p);
									$.reset(div_13);

									var div_15 = $.sibling(div_13, 2);
									var node_38 = $.child(div_15);

									Label(node_38, {
										class: 'text-sm font-medium',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('Date Only');

											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});

									var node_39 = $.sibling(node_38, 2);

									Input(node_39, {
										class: 'font-mono text-sm',
										placeholder: 'e.g. PP',
										get value() {
											return $.get(dateAndTimeFormat).dateOnly;
										},

										oninput: (e) => {
											$.get(dateAndTimeFormat).dateOnly = e.currentTarget.value;
										}
									});

									var div_16 = $.sibling(node_39, 2);

									$.each(div_16, 21, () => dateOnlySuggestions, (s) => s.value, ($$anchor, s) => {
										{
											let $0 = $.derived(() => $.get(dateAndTimeFormat).dateOnly === $.get(s).value ? "default" : "outline");

											Badge($$anchor, {
												get variant() {
													return $.get($0);
												},
												class: 'cursor-pointer',
												href: undefined,
												onclick: () => {
													$.get(dateAndTimeFormat).dateOnly = $.get(s).value;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text();

													$.template_effect(() => $.set_text(text_15, `${$.get(s).label ?? ''} (${$.get(s).value ?? ''})`));
													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										}
									});

									$.reset(div_16);

									var p_1 = $.sibling(div_16, 2);
									var code_2 = $.sibling($.child(p_1));
									var text_16 = $.only_child(code_2, true);

									$.reset(p_1);
									$.reset(div_15);

									var div_17 = $.sibling(div_15, 2);
									var node_40 = $.child(div_17);

									Label(node_40, {
										class: 'text-sm font-medium',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_17 = $.text('Time Only');

											$.append($$anchor, text_17);
										},
										$$slots: { default: true }
									});

									var node_41 = $.sibling(node_40, 2);

									Input(node_41, {
										class: 'font-mono text-sm',
										placeholder: 'e.g. pp',
										get value() {
											return $.get(dateAndTimeFormat).timeOnly;
										},

										oninput: (e) => {
											$.get(dateAndTimeFormat).timeOnly = e.currentTarget.value;
										}
									});

									var div_18 = $.sibling(node_41, 2);

									$.each(div_18, 21, () => timeOnlySuggestions, (s) => s.value, ($$anchor, s) => {
										{
											let $0 = $.derived(() => $.get(dateAndTimeFormat).timeOnly === $.get(s).value ? "default" : "outline");

											Badge($$anchor, {
												get variant() {
													return $.get($0);
												},
												class: 'cursor-pointer',
												href: undefined,
												onclick: () => {
													$.get(dateAndTimeFormat).timeOnly = $.get(s).value;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text();

													$.template_effect(() => $.set_text(text_18, `${$.get(s).label ?? ''} (${$.get(s).value ?? ''})`));
													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});
										}
									});

									$.reset(div_18);

									var p_2 = $.sibling(div_18, 2);
									var code_3 = $.sibling($.child(p_2));
									var text_19 = $.only_child(code_3, true);

									$.reset(p_2);
									$.reset(div_17);

									$.template_effect(
										($0, $1, $2) => {
											$.set_text(text_13, $0);
											$.set_text(text_16, $1);
											$.set_text(text_19, $2);
										},
										[
											() => formatPreview($.get(dateAndTimeFormat).datePlusTime),
											() => formatPreview($.get(dateAndTimeFormat).dateOnly),
											() => formatPreview($.get(dateAndTimeFormat).timeOnly)
										]
									);

									$.append($$anchor, fragment_21);
								},
								$$slots: { default: true }
							});
						});

						var node_42 = $.sibling(node_35, 2);

						$.component(node_42, () => Card.Footer, ($$anchor, Card_Footer_2) => {
							Card_Footer_2($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveDateTimeFormat,
										get disabled() {
											return $.get(savingDateTimeFormat);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_29 = root_13();
											var node_43 = $.first_child(fragment_29);

											{
												var consequent_4 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												var alternate_2 = ($$anchor) => {
													SaveIcon($$anchor, { class: 'h-4 w-4' });
												};

												$.if(node_43, ($$render) => {
													if ($.get(savingDateTimeFormat)) $$render(consequent_4); else $$render(alternate_2, -1);
												});
											}

											$.next();
											$.append($$anchor, fragment_29);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_19);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate_3, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}