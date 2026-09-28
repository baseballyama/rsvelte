import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full"><div class="overflow-hidden rounded-md border"><!></div></div>`);
var root_3 = $.from_html(`<!> Save Footer`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="ktable rounded-lg border"><!></div>`);
var root_8 = $.from_html(`<!> Save Colors`, 1);

var root_9 = $.from_html(`<p>You can use any web font by providing the CSS URL and font family name. Popular sources include Google
                Fonts and Bunny Fonts.</p>`);

var root_10 = $.from_html(`Font <!>`, 1);
var root_11 = $.from_html(`<div class="grid gap-4 md:grid-cols-2"><div><!> <!> <p class="text-muted-foreground mt-1 text-xs">The URL to the CSS file that loads the font</p></div> <div><!> <!> <p class="text-muted-foreground mt-1 text-xs">The name of the font family as defined in the CSS</p></div></div> <p class="text-muted-foreground mt-4 text-sm">Want to upload and use custom fonts? Read more about it in the <a href="https://kener.ing/docs/v4/guides/custom-fonts" target="_blank" class="text-foreground underline underline-offset-4">documentation</a>.</p>`, 1);
var root_12 = $.from_html(`<!> Save Font`, 1);
var root_13 = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div>`, 1);
var root_14 = $.from_html(`<div class="space-y-3"><!> <!> <p class="text-muted-foreground text-xs">The theme that will be used by default when users visit your status page.</p></div> <div class="flex items-start space-x-3 rounded-lg border p-4"><!> <div class="space-y-1"><!> <p class="text-muted-foreground text-sm">When enabled, users can switch between light and dark themes using a toggle button.</p></div></div>`, 1);
var root_15 = $.from_html(`<!> Save Theme`, 1);
var root_16 = $.from_html(`<div class="grid gap-4 md:grid-cols-2"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="space-y-2"><!> <!></div> <div class="grid gap-4 md:grid-cols-3"><div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Leave empty for null.</p></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="flex items-start space-x-3 rounded-lg border p-4"><!> <div class="space-y-1"><!> <p class="text-muted-foreground text-sm">Allow users to dismiss the announcement.</p></div></div>`, 1);
var root_17 = $.from_html(`<!> Save Announcement`, 1);
var root_18 = $.from_html(`<div class="flex items-center justify-center py-6"><!></div>`);
var root_19 = $.from_html(`<p class="text-muted-foreground py-4 text-center text-sm">No pages found.</p>`);
var root_20 = $.from_html(`<div class="flex items-center gap-1"><!> <!></div>`);
var root_21 = $.from_html(`<div><div class="flex items-center gap-3"><!> <div><p class="text-sm font-medium"> </p> <p class="text-muted-foreground text-xs"> </p></div></div> <!></div>`);
var root_22 = $.from_html(`<div class="rounded-lg border"></div>`);
var root_23 = $.from_html(`<div class="flex items-start space-x-3 rounded-lg border p-4"><!> <div class="space-y-1"><!> <p class="text-muted-foreground text-sm">When enabled, pages will be displayed in the order below instead of the default creation order.</p></div></div> <!>`, 1);
var root_24 = $.from_html(`<!> Save Page Ordering`, 1);

var root_25 = $.from_html(
	`Add custom CSS to further customize the appearance of your status page. Do not include &lt;style&gt; tags.
          Learn more in the <a href="https://kener.ing/docs/v4/guides/custom-js-css-guide" target="_blank" class="text-foreground underline underline-offset-4">documentation</a>.`,
	1
);

var root_26 = $.from_html(`<!> Save Custom CSS`, 1);
var root_27 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_28 = $.from_html(`<div class="flex w-full flex-col gap-6 overflow-hidden"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// State
	let loading = $.state(true);

	let savingFooter = $.state(false);
	let savingColors = $.state(false);
	let savingFont = $.state(false);
	let savingCSS = $.state(false);
	let savingTheme = $.state(false);
	let savingAnnouncement = $.state(false);
	let savingPageOrdering = $.state(false);
	let loadingPages = $.state(false);

	// Data
	let footerHTML = $.state("");

	let defaultFooterHTML = $.state("");
	let theme = $.state("system");
	let themeToggle = $.state("YES");

	let colors = $.state($.proxy({
		UP: "#67ab95",
		DOWN: "#ca3038",
		DEGRADED: "#e6ca61",
		MAINTENANCE: "#6679cc",
		ACCENT: "#f4f4f5",
		ACCENT_FOREGROUND: "#e96e2d"
	}));

	let colorsDark = $.state($.proxy({
		UP: "#67ab95",
		DOWN: "#ca3038",
		DEGRADED: "#e6ca61",
		MAINTENANCE: "#6679cc",
		ACCENT: "#27272a",
		ACCENT_FOREGROUND: "#e96e2d"
	}));

	let font = $.state($.proxy({ cssSrc: "", family: "" }));
	let customCSS = $.state("");

	let announcement = $.state($.proxy({
		title: "",
		message: "",
		type: "INFO",
		reshowAfterInHours: "",
		cancellable: true,
		ctaURL: "",
		ctaText: ""
	}));

	// Page ordering
	let pageOrderingEnabled = $.state(false);

	let orderedPageIds = $.state($.proxy([]));
	let allPages = $.state($.proxy([]));

	let displayPages = $.derived(() => {
		if ($.get(orderedPageIds).length === 0) {
			return $.get(allPages);
		}

		const ordered = [];

		for (const id of $.get(orderedPageIds)) {
			const page = $.get(allPages).find((p) => p.id === id);

			if (page) ordered.push(page);
		}

		// Append pages not in the order list (newly added)
		for (const page of $.get(allPages)) {
			if (!$.get(orderedPageIds).includes(page.id)) {
				ordered.push(page);
			}
		}

		return ordered;
	});

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
				if (result.footerHTML) {
					$.set(footerHTML, result.footerHTML, true);
				}

				if (result.colors) {
					$.set(
						colors,
						{
							UP: result.colors.UP || "#67ab95",
							DOWN: result.colors.DOWN || "#ca3038",
							DEGRADED: result.colors.DEGRADED || "#e6ca61",
							MAINTENANCE: result.colors.MAINTENANCE || "#6679cc",
							ACCENT: result.colors.ACCENT || "#f4f4f5",
							ACCENT_FOREGROUND: result.colors.ACCENT_FOREGROUND || result.colors.ACCENT || "#e96e2d"
						},
						true
					);
				}

				if (result.colorsDark) {
					$.set(
						colorsDark,
						{
							UP: result.colorsDark.UP || $.get(colors).UP,
							DOWN: result.colorsDark.DOWN || $.get(colors).DOWN,
							DEGRADED: result.colorsDark.DEGRADED || $.get(colors).DEGRADED,
							MAINTENANCE: result.colorsDark.MAINTENANCE || $.get(colors).MAINTENANCE,
							ACCENT: result.colorsDark.ACCENT || "#27272a",
							ACCENT_FOREGROUND: result.colorsDark.ACCENT_FOREGROUND || result.colorsDark.ACCENT || $.get(colors).ACCENT_FOREGROUND
						},
						true
					);
				} else {
					$.set(colorsDark, { ...$.get(colors), ACCENT: "#27272a" }, true);
				}

				if (result.font) {
					$.set(
						font,
						{
							cssSrc: result.font.cssSrc || "",
							family: result.font.family || ""
						},
						true
					);
				}

				if (result.customCSS) {
					$.set(customCSS, result.customCSS, true);
				}

				if (result.theme) {
					$.set(theme, result.theme, true);
				}

				if (result.themeToggle) {
					$.set(themeToggle, result.themeToggle, true);
				}

				if (result.announcement) {
					$.set(
						announcement,
						{
							title: result.announcement.title || "",
							message: result.announcement.message || "",
							type: result.announcement.type || "INFO",
							reshowAfterInHours: result.announcement.reshowAfterInHours === null || result.announcement.reshowAfterInHours === undefined ? "" : String(result.announcement.reshowAfterInHours),
							cancellable: result.announcement.cancellable ?? true,
							ctaURL: result.announcement.ctaURL || "",
							ctaText: result.announcement.ctaText || ""
						},
						true
					);
				}

				if (result.pageOrderingSettings) {
					$.set(pageOrderingEnabled, result.pageOrderingSettings.enabled ?? false, true);
					$.set(orderedPageIds, result.pageOrderingSettings.order ?? [], true);
				}
			}

			// Set default footer HTML
			$.set(defaultFooterHTML, `<div class="container relative mt-4 max-w-[655px]">
  <div class="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
    <p class="text-center text-sm leading-loose text-muted-foreground">
      Made using 
      <a href="https://github.com/rajnandan1/kener" target="_blank" class="font-medium underline underline-offset-4">
        Kener
      </a>
      an open source status page system built with Svelte and TailwindCSS.
    </p>
  </div>
</div>`);
		} catch(e) {
			toast.error("Failed to load settings");
		} finally {
			$.set(loading, false);
		}
	}

	// Save functions for each section
	async function saveFooter() {
		$.set(savingFooter, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { footerHTML: $.get(footerHTML) }
				})
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
			$.set(savingFooter, false);
		}
	}

	async function saveColors() {
		$.set(savingColors, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: {
						colors: JSON.stringify($.get(colors)),
						colorsDark: JSON.stringify($.get(colorsDark))
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
			$.set(savingColors, false);
		}
	}

	async function saveFont() {
		$.set(savingFont, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { font: JSON.stringify($.get(font)) }
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
			$.set(savingFont, false);
		}
	}

	async function saveCustomCSS() {
		$.set(savingCSS, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { customCSS: $.get(customCSS) }
				})
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
			$.set(savingCSS, false);
		}
	}

	async function saveTheme() {
		$.set(savingTheme, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { theme: $.get(theme), themeToggle: $.get(themeToggle) }
				})
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
			$.set(savingTheme, false);
		}
	}

	async function saveAnnouncement() {
		$.set(savingAnnouncement, true);

		try {
			const rawReshow = $.get(announcement).reshowAfterInHours;
			const parsedReshow = rawReshow == null ? "" : String(rawReshow).trim();
			const reshowAfterInHours = parsedReshow.length === 0 ? null : Math.max(0, Number(parsedReshow));

			const payload = {
				title: $.get(announcement).title.trim(),
				message: $.get(announcement).message.trim(),
				type: $.get(announcement).type,
				reshowAfterInHours: Number.isFinite(reshowAfterInHours) ? reshowAfterInHours : null,
				cancellable: $.get(announcement).cancellable,
				ctaURL: $.get(announcement).ctaURL.trim() ? $.get(announcement).ctaURL.trim() : null,
				ctaText: $.get(announcement).ctaText.trim() ? $.get(announcement).ctaText.trim() : null
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
				$.get(announcement).reshowAfterInHours = reshowAfterInHours == null ? "" : String(reshowAfterInHours);
				toast.success("Announcement settings saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save announcement settings");
		} finally {
			$.set(savingAnnouncement, false);
		}
	}

	async function fetchPages() {
		$.set(loadingPages, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getPages" })
			});

			const result = await response.json();

			if (Array.isArray(result)) {
				$.set(allPages, result.map((p) => ({ id: p.id, page_path: p.page_path, page_title: p.page_title })), true);
			}
		} catch {
			// silently fail
		} finally {
			$.set(loadingPages, false);
		}
	}

	async function savePageOrdering() {
		$.set(savingPageOrdering, true);

		try {
			const payload = {
				enabled: $.get(pageOrderingEnabled),
				order: $.get(displayPages).map((p) => p.id)
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
				$.set(orderedPageIds, $.get(displayPages).map((p) => p.id), true);
				toast.success("Page ordering saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save page ordering");
		} finally {
			$.set(savingPageOrdering, false);
		}
	}

	function movePageUp(index) {
		if (index <= 0) return;

		const pages = $.get(displayPages).map((p) => p.id);

		[pages[index - 1], pages[index]] = [pages[index], pages[index - 1]];
		$.set(orderedPageIds, pages, true);
	}

	function movePageDown(index) {
		const pages = $.get(displayPages).map((p) => p.id);

		if (index >= pages.length - 1) return;

		[pages[index], pages[index + 1]] = [pages[index + 1], pages[index]];
		$.set(orderedPageIds, pages, true);
	}

	function resetFooter() {
		$.set(footerHTML, $.get(defaultFooterHTML), true);
	}

	// Initialize on mount
	onMount(() => {
		fetchSettings();
		fetchPages();
	});

	var div = root_28();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, { class: 'h-6 w-6' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_1 = ($$anchor) => {
			var fragment = root_27();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_4();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Site Footer');

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

												var text_1 = $.text('Customize the footer HTML of your status page. Use HTML to add links, text, and other content.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_3, 2);

						$.component(node_6, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'pt-6',
								children: ($$anchor, $$slotProps) => {
									var div_2 = root_2();
									var div_3 = $.child(div_2);
									var node_7 = $.child(div_3);

									{
										let $0 = $.derived(html);
										let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

										CodeMirror(node_7, {
											get lang() {
												return $.get($0);
											},

											get theme() {
												return $.get($1);
											},
											styles: { "&": { width: "100%", maxWidth: "100%", height: "320px" } },
											get value() {
												return $.get(footerHTML);
											},

											set value($$value) {
												$.set(footerHTML, $$value, true);
											}
										});
									}

									$.reset(div_3);
									$.reset(div_2);
									$.append($$anchor, div_2);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_6, 2);

						$.component(node_8, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-between border-t pt-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_9 = $.first_child(fragment_3);

									Button(node_9, {
										variant: 'outline',
										onclick: resetFooter,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Reset to Default');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Button(node_10, {
										onclick: saveFooter,
										get disabled() {
											return $.get(savingFooter);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_3();
											var node_11 = $.first_child(fragment_4);

											{
												var consequent_1 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												$.if(node_11, ($$render) => {
													if ($.get(savingFooter)) $$render(consequent_1);
												});
											}

											$.next();
											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_2, 2);

			$.component(node_12, () => Card.Root, ($$anchor, Card_Root_1) => {
				Card_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_4();
						var node_13 = $.first_child(fragment_6);

						$.component(node_13, () => Card.Header, ($$anchor, Card_Header_1) => {
							Card_Header_1($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_14 = $.first_child(fragment_7);

									$.component(node_14, () => Card.Title, ($$anchor, Card_Title_1) => {
										Card_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Status Colors');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Card.Description, ($$anchor, Card_Description_1) => {
										Card_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Customize the colors used to represent different monitor statuses. Set separate colors for light and dark\n          themes.');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_13, 2);

						$.component(node_16, () => Card.Content, ($$anchor, Card_Content_1) => {
							Card_Content_1($$anchor, {
								class: 'pt-6',
								children: ($$anchor, $$slotProps) => {
									var div_4 = root_7();
									var node_17 = $.child(div_4);

									$.component(node_17, () => Table.Root, ($$anchor, Table_Root) => {
										Table_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_1();
												var node_18 = $.first_child(fragment_8);

												$.component(node_18, () => Table.Header, ($$anchor, Table_Header) => {
													Table_Header($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_19 = $.first_child(fragment_9);

															$.component(node_19, () => Table.Row, ($$anchor, Table_Row) => {
																Table_Row($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_4();
																		var node_20 = $.first_child(fragment_10);

																		$.component(node_20, () => Table.Head, ($$anchor, Table_Head) => {
																			Table_Head($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('Name');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_21 = $.sibling(node_20, 2);

																		$.component(node_21, () => Table.Head, ($$anchor, Table_Head_1) => {
																			Table_Head_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('Light');

																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_22 = $.sibling(node_21, 2);

																		$.component(node_22, () => Table.Head, ($$anchor, Table_Head_2) => {
																			Table_Head_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_7 = $.text('Dark');

																					$.append($$anchor, text_7);
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
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_18, 2);

												$.component(node_23, () => Table.Body, ($$anchor, Table_Body) => {
													Table_Body($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_6();
															var node_24 = $.first_child(fragment_11);

															$.component(node_24, () => Table.Row, ($$anchor, Table_Row_1) => {
																Table_Row_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = root_4();
																		var node_25 = $.first_child(fragment_12);

																		$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell) => {
																			Table_Cell($$anchor, {
																				class: 'font-medium',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_8 = $.text();

																					$.template_effect(() => $.set_text(text_8, constants.UP));
																					$.append($$anchor, text_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_26 = $.sibling(node_25, 2);

																		$.component(node_26, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																			Table_Cell_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = root_5();
																					var node_27 = $.first_child(fragment_14);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_27, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_27.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colors).UP;
																							},

																							set hex($$value) {
																								$.get(colors).UP = $$value;
																							}
																						});

																						$.reset(node_27);
																					}

																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_28 = $.sibling(node_26, 2);

																		$.component(node_28, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																			Table_Cell_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_15 = root_5();
																					var node_29 = $.first_child(fragment_15);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_29, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_29.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colorsDark).UP;
																							},

																							set hex($$value) {
																								$.get(colorsDark).UP = $$value;
																							}
																						});

																						$.reset(node_29);
																					}

																					$.append($$anchor, fragment_15);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_12);
																	},
																	$$slots: { default: true }
																});
															});

															var node_30 = $.sibling(node_24, 2);

															$.component(node_30, () => Table.Row, ($$anchor, Table_Row_2) => {
																Table_Row_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_16 = root_4();
																		var node_31 = $.first_child(fragment_16);

																		$.component(node_31, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																			Table_Cell_3($$anchor, {
																				class: 'font-medium',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_9 = $.text();

																					$.template_effect(() => $.set_text(text_9, constants.DEGRADED));
																					$.append($$anchor, text_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_32 = $.sibling(node_31, 2);

																		$.component(node_32, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																			Table_Cell_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_18 = root_5();
																					var node_33 = $.first_child(fragment_18);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_33, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_33.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colors).DEGRADED;
																							},

																							set hex($$value) {
																								$.get(colors).DEGRADED = $$value;
																							}
																						});

																						$.reset(node_33);
																					}

																					$.append($$anchor, fragment_18);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_34 = $.sibling(node_32, 2);

																		$.component(node_34, () => Table.Cell, ($$anchor, Table_Cell_5) => {
																			Table_Cell_5($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_19 = root_5();
																					var node_35 = $.first_child(fragment_19);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_35, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_35.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colorsDark).DEGRADED;
																							},

																							set hex($$value) {
																								$.get(colorsDark).DEGRADED = $$value;
																							}
																						});

																						$.reset(node_35);
																					}

																					$.append($$anchor, fragment_19);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_16);
																	},
																	$$slots: { default: true }
																});
															});

															var node_36 = $.sibling(node_30, 2);

															$.component(node_36, () => Table.Row, ($$anchor, Table_Row_3) => {
																Table_Row_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_20 = root_4();
																		var node_37 = $.first_child(fragment_20);

																		$.component(node_37, () => Table.Cell, ($$anchor, Table_Cell_6) => {
																			Table_Cell_6($$anchor, {
																				class: 'font-medium',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_10 = $.text();

																					$.template_effect(() => $.set_text(text_10, constants.DOWN));
																					$.append($$anchor, text_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_38 = $.sibling(node_37, 2);

																		$.component(node_38, () => Table.Cell, ($$anchor, Table_Cell_7) => {
																			Table_Cell_7($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_22 = root_5();
																					var node_39 = $.first_child(fragment_22);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_39, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_39.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colors).DOWN;
																							},

																							set hex($$value) {
																								$.get(colors).DOWN = $$value;
																							}
																						});

																						$.reset(node_39);
																					}

																					$.append($$anchor, fragment_22);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_40 = $.sibling(node_38, 2);

																		$.component(node_40, () => Table.Cell, ($$anchor, Table_Cell_8) => {
																			Table_Cell_8($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_23 = root_5();
																					var node_41 = $.first_child(fragment_23);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_41, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_41.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colorsDark).DOWN;
																							},

																							set hex($$value) {
																								$.get(colorsDark).DOWN = $$value;
																							}
																						});

																						$.reset(node_41);
																					}

																					$.append($$anchor, fragment_23);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_20);
																	},
																	$$slots: { default: true }
																});
															});

															var node_42 = $.sibling(node_36, 2);

															$.component(node_42, () => Table.Row, ($$anchor, Table_Row_4) => {
																Table_Row_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_24 = root_4();
																		var node_43 = $.first_child(fragment_24);

																		$.component(node_43, () => Table.Cell, ($$anchor, Table_Cell_9) => {
																			Table_Cell_9($$anchor, {
																				class: 'font-medium',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_11 = $.text();

																					$.template_effect(() => $.set_text(text_11, constants.MAINTENANCE));
																					$.append($$anchor, text_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_44 = $.sibling(node_43, 2);

																		$.component(node_44, () => Table.Cell, ($$anchor, Table_Cell_10) => {
																			Table_Cell_10($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_26 = root_5();
																					var node_45 = $.first_child(fragment_26);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_45, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_45.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colors).MAINTENANCE;
																							},

																							set hex($$value) {
																								$.get(colors).MAINTENANCE = $$value;
																							}
																						});

																						$.reset(node_45);
																					}

																					$.append($$anchor, fragment_26);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_46 = $.sibling(node_44, 2);

																		$.component(node_46, () => Table.Cell, ($$anchor, Table_Cell_11) => {
																			Table_Cell_11($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_27 = root_5();
																					var node_47 = $.first_child(fragment_27);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_47, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_47.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colorsDark).MAINTENANCE;
																							},

																							set hex($$value) {
																								$.get(colorsDark).MAINTENANCE = $$value;
																							}
																						});

																						$.reset(node_47);
																					}

																					$.append($$anchor, fragment_27);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_24);
																	},
																	$$slots: { default: true }
																});
															});

															var node_48 = $.sibling(node_42, 2);

															$.component(node_48, () => Table.Row, ($$anchor, Table_Row_5) => {
																Table_Row_5($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_28 = root_4();
																		var node_49 = $.first_child(fragment_28);

																		$.component(node_49, () => Table.Cell, ($$anchor, Table_Cell_12) => {
																			Table_Cell_12($$anchor, {
																				class: 'font-medium',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_12 = $.text('Accent');

																					$.append($$anchor, text_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_50 = $.sibling(node_49, 2);

																		$.component(node_50, () => Table.Cell, ($$anchor, Table_Cell_13) => {
																			Table_Cell_13($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_29 = root_5();
																					var node_51 = $.first_child(fragment_29);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_51, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_51.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colors).ACCENT;
																							},

																							set hex($$value) {
																								$.get(colors).ACCENT = $$value;
																							}
																						});

																						$.reset(node_51);
																					}

																					$.append($$anchor, fragment_29);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_52 = $.sibling(node_50, 2);

																		$.component(node_52, () => Table.Cell, ($$anchor, Table_Cell_14) => {
																			Table_Cell_14($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_30 = root_5();
																					var node_53 = $.first_child(fragment_30);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_53, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_53.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colorsDark).ACCENT;
																							},

																							set hex($$value) {
																								$.get(colorsDark).ACCENT = $$value;
																							}
																						});

																						$.reset(node_53);
																					}

																					$.append($$anchor, fragment_30);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_28);
																	},
																	$$slots: { default: true }
																});
															});

															var node_54 = $.sibling(node_48, 2);

															$.component(node_54, () => Table.Row, ($$anchor, Table_Row_6) => {
																Table_Row_6($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_31 = root_4();
																		var node_55 = $.first_child(fragment_31);

																		$.component(node_55, () => Table.Cell, ($$anchor, Table_Cell_15) => {
																			Table_Cell_15($$anchor, {
																				class: 'font-medium',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_13 = $.text('Accent Foreground');

																					$.append($$anchor, text_13);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_56 = $.sibling(node_55, 2);

																		$.component(node_56, () => Table.Cell, ($$anchor, Table_Cell_16) => {
																			Table_Cell_16($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_32 = root_5();
																					var node_57 = $.first_child(fragment_32);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_57, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_57.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colors).ACCENT_FOREGROUND;
																							},

																							set hex($$value) {
																								$.get(colors).ACCENT_FOREGROUND = $$value;
																							}
																						});

																						$.reset(node_57);
																					}

																					$.append($$anchor, fragment_32);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_58 = $.sibling(node_56, 2);

																		$.component(node_58, () => Table.Cell, ($$anchor, Table_Cell_17) => {
																			Table_Cell_17($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_33 = root_5();
																					var node_59 = $.first_child(fragment_33);

																					{
																						let $0 = $.derived(() => mode.current === "dark");

																						$.css_props(node_59, () => ({ '--input-size': '16px' }));

																						ColorPicker(node_59.lastChild, {
																							position: 'responsive',
																							isAlpha: false,
																							get isDark() {
																								return $.get($0);
																							},
																							isTextInput: true,
																							label: '',
																							get hex() {
																								return $.get(colorsDark).ACCENT_FOREGROUND;
																							},

																							set hex($$value) {
																								$.get(colorsDark).ACCENT_FOREGROUND = $$value;
																							}
																						});

																						$.reset(node_59);
																					}

																					$.append($$anchor, fragment_33);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_31);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_4);
									$.append($$anchor, div_4);
								},
								$$slots: { default: true }
							});
						});

						var node_60 = $.sibling(node_16, 2);

						$.component(node_60, () => Card.Footer, ($$anchor, Card_Footer_1) => {
							Card_Footer_1($$anchor, {
								class: 'flex justify-end border-t pt-6',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveColors,
										get disabled() {
											return $.get(savingColors);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_35 = root_8();
											var node_61 = $.first_child(fragment_35);

											{
												var consequent_2 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												$.if(node_61, ($$render) => {
													if ($.get(savingColors)) $$render(consequent_2);
												});
											}

											$.next();
											$.append($$anchor, fragment_35);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			var node_62 = $.sibling(node_12, 2);

			$.component(node_62, () => Card.Root, ($$anchor, Card_Root_2) => {
				Card_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_37 = root_4();
						var node_63 = $.first_child(fragment_37);

						$.component(node_63, () => Card.Header, ($$anchor, Card_Header_2) => {
							Card_Header_2($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_38 = root_1();
									var node_64 = $.first_child(fragment_38);

									$.component(node_64, () => Card.Title, ($$anchor, Card_Title_2) => {
										Card_Title_2($$anchor, {
											class: 'flex items-center gap-2',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_39 = root_10();
												var node_65 = $.sibling($.first_child(fragment_39));

												$.component(node_65, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
													Tooltip_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_40 = root_1();
															var node_66 = $.first_child(fragment_40);

															$.component(node_66, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																Tooltip_Trigger($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		Info($$anchor, { class: 'text-muted-foreground h-4 w-4' });
																	},
																	$$slots: { default: true }
																});
															});

															var node_67 = $.sibling(node_66, 2);

															$.component(node_67, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																Tooltip_Content($$anchor, {
																	class: 'max-w-xs',
																	children: ($$anchor, $$slotProps) => {
																		var p_1 = root_9();

																		$.append($$anchor, p_1);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_40);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_39);
											},
											$$slots: { default: true }
										});
									});

									var node_68 = $.sibling(node_64, 2);

									$.component(node_68, () => Card.Description, ($$anchor, Card_Description_2) => {
										Card_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Customize the font used throughout your status page.');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_38);
								},
								$$slots: { default: true }
							});
						});

						var node_69 = $.sibling(node_63, 2);

						$.component(node_69, () => Card.Content, ($$anchor, Card_Content_2) => {
							Card_Content_2($$anchor, {
								class: 'pt-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_42 = root_11();
									var div_5 = $.first_child(fragment_42);
									var div_6 = $.child(div_5);
									var node_70 = $.child(div_6);

									Label(node_70, {
										for: 'font-url',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('Font CSS URL');

											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});

									var node_71 = $.sibling(node_70, 2);

									Input(node_71, {
										type: 'text',
										id: 'font-url',
										placeholder: 'https://fonts.bunny.net/css?family=lato:400,700&display=swap',
										class: 'mt-1',
										get value() {
											return $.get(font).cssSrc;
										},

										set value($$value) {
											$.get(font).cssSrc = $$value;
										}
									});

									$.next(2);
									$.reset(div_6);

									var div_7 = $.sibling(div_6, 2);
									var node_72 = $.child(div_7);

									Label(node_72, {
										for: 'font-family',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Font Family Name');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									var node_73 = $.sibling(node_72, 2);

									Input(node_73, {
										type: 'text',
										id: 'font-family',
										placeholder: 'Lato',
										class: 'mt-1',
										get value() {
											return $.get(font).family;
										},

										set value($$value) {
											$.get(font).family = $$value;
										}
									});

									$.next(2);
									$.reset(div_7);
									$.reset(div_5);
									$.next(2);
									$.append($$anchor, fragment_42);
								},
								$$slots: { default: true }
							});
						});

						var node_74 = $.sibling(node_69, 2);

						$.component(node_74, () => Card.Footer, ($$anchor, Card_Footer_2) => {
							Card_Footer_2($$anchor, {
								class: 'flex justify-end border-t pt-6',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveFont,
										get disabled() {
											return $.get(savingFont);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_44 = root_12();
											var node_75 = $.first_child(fragment_44);

											{
												var consequent_3 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												$.if(node_75, ($$render) => {
													if ($.get(savingFont)) $$render(consequent_3);
												});
											}

											$.next();
											$.append($$anchor, fragment_44);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_37);
					},
					$$slots: { default: true }
				});
			});

			var node_76 = $.sibling(node_62, 2);

			$.component(node_76, () => Card.Root, ($$anchor, Card_Root_3) => {
				Card_Root_3($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_46 = root_4();
						var node_77 = $.first_child(fragment_46);

						$.component(node_77, () => Card.Header, ($$anchor, Card_Header_3) => {
							Card_Header_3($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_47 = root_1();
									var node_78 = $.first_child(fragment_47);

									$.component(node_78, () => Card.Title, ($$anchor, Card_Title_3) => {
										Card_Title_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_17 = $.text('Theme');

												$.append($$anchor, text_17);
											},
											$$slots: { default: true }
										});
									});

									var node_79 = $.sibling(node_78, 2);

									$.component(node_79, () => Card.Description, ($$anchor, Card_Description_3) => {
										Card_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_18 = $.text('Configure the default theme and user preferences for your status page.');

												$.append($$anchor, text_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_47);
								},
								$$slots: { default: true }
							});
						});

						var node_80 = $.sibling(node_77, 2);

						$.component(node_80, () => Card.Content, ($$anchor, Card_Content_3) => {
							Card_Content_3($$anchor, {
								class: 'space-y-6 pt-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_48 = root_14();
									var div_8 = $.first_child(fragment_48);
									var node_81 = $.child(div_8);

									Label(node_81, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text('Default Theme');

											$.append($$anchor, text_19);
										},
										$$slots: { default: true }
									});

									var node_82 = $.sibling(node_81, 2);

									$.component(node_82, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
										RadioGroup_Root($$anchor, {
											class: 'flex flex-col gap-3',
											get value() {
												return $.get(theme);
											},

											set value($$value) {
												$.set(theme, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_49 = root_13();
												var div_9 = $.first_child(fragment_49);
												var node_83 = $.child(div_9);

												$.component(node_83, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
													RadioGroup_Item($$anchor, { value: 'light', id: 'theme-light' });
												});

												var node_84 = $.sibling(node_83, 2);

												Label(node_84, {
													for: 'theme-light',
													class: 'cursor-pointer font-normal',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_20 = $.text('Light');

														$.append($$anchor, text_20);
													},
													$$slots: { default: true }
												});

												$.reset(div_9);

												var div_10 = $.sibling(div_9, 2);
												var node_85 = $.child(div_10);

												$.component(node_85, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
													RadioGroup_Item_1($$anchor, { value: 'dark', id: 'theme-dark' });
												});

												var node_86 = $.sibling(node_85, 2);

												Label(node_86, {
													for: 'theme-dark',
													class: 'cursor-pointer font-normal',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_21 = $.text('Dark');

														$.append($$anchor, text_21);
													},
													$$slots: { default: true }
												});

												$.reset(div_10);

												var div_11 = $.sibling(div_10, 2);
												var node_87 = $.child(div_11);

												$.component(node_87, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
													RadioGroup_Item_2($$anchor, { value: 'system', id: 'theme-system' });
												});

												var node_88 = $.sibling(node_87, 2);

												Label(node_88, {
													for: 'theme-system',
													class: 'cursor-pointer font-normal',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_22 = $.text('System');

														$.append($$anchor, text_22);
													},
													$$slots: { default: true }
												});

												$.reset(div_11);
												$.append($$anchor, fragment_49);
											},
											$$slots: { default: true }
										});
									});

									$.next(2);
									$.reset(div_8);

									var div_12 = $.sibling(div_8, 2);
									var node_89 = $.child(div_12);

									{
										let $0 = $.derived(() => $.get(themeToggle) === "YES");

										Checkbox(node_89, {
											id: 'theme-toggle',
											get checked() {
												return $.get($0);
											},
											onCheckedChange: (checked) => $.set(themeToggle, checked ? "YES" : "NO", true)
										});
									}

									var div_13 = $.sibling(node_89, 2);
									var node_90 = $.child(div_13);

									Label(node_90, {
										for: 'theme-toggle',
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_23 = $.text('Allow users to toggle theme');

											$.append($$anchor, text_23);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_13);
									$.reset(div_12);
									$.append($$anchor, fragment_48);
								},
								$$slots: { default: true }
							});
						});

						var node_91 = $.sibling(node_80, 2);

						$.component(node_91, () => Card.Footer, ($$anchor, Card_Footer_3) => {
							Card_Footer_3($$anchor, {
								class: 'flex justify-end border-t pt-6',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveTheme,
										get disabled() {
											return $.get(savingTheme);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_51 = root_15();
											var node_92 = $.first_child(fragment_51);

											{
												var consequent_4 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												$.if(node_92, ($$render) => {
													if ($.get(savingTheme)) $$render(consequent_4);
												});
											}

											$.next();
											$.append($$anchor, fragment_51);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_46);
					},
					$$slots: { default: true }
				});
			});

			var node_93 = $.sibling(node_76, 2);

			$.component(node_93, () => Card.Root, ($$anchor, Card_Root_4) => {
				Card_Root_4($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_53 = root_4();
						var node_94 = $.first_child(fragment_53);

						$.component(node_94, () => Card.Header, ($$anchor, Card_Header_4) => {
							Card_Header_4($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_54 = root_1();
									var node_95 = $.first_child(fragment_54);

									$.component(node_95, () => Card.Title, ($$anchor, Card_Title_4) => {
										Card_Title_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_24 = $.text('Announcement');

												$.append($$anchor, text_24);
											},
											$$slots: { default: true }
										});
									});

									var node_96 = $.sibling(node_95, 2);

									$.component(node_96, () => Card.Description, ($$anchor, Card_Description_4) => {
										Card_Description_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_25 = $.text('Configure a site-wide announcement message shown to visitors.');

												$.append($$anchor, text_25);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_54);
								},
								$$slots: { default: true }
							});
						});

						var node_97 = $.sibling(node_94, 2);

						$.component(node_97, () => Card.Content, ($$anchor, Card_Content_4) => {
							Card_Content_4($$anchor, {
								class: 'space-y-4 pt-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_55 = root_16();
									var div_14 = $.first_child(fragment_55);
									var div_15 = $.child(div_14);
									var node_98 = $.child(div_15);

									Label(node_98, {
										for: 'announcement-title',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_26 = $.text('Title');

											$.append($$anchor, text_26);
										},
										$$slots: { default: true }
									});

									var node_99 = $.sibling(node_98, 2);

									Input(node_99, {
										id: 'announcement-title',
										placeholder: 'Scheduled Maintenance',
										get value() {
											return $.get(announcement).title;
										},

										set value($$value) {
											$.get(announcement).title = $$value;
										}
									});

									$.reset(div_15);

									var div_16 = $.sibling(div_15, 2);
									var node_100 = $.child(div_16);

									Label(node_100, {
										for: 'announcement-type',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_27 = $.text('Type');

											$.append($$anchor, text_27);
										},
										$$slots: { default: true }
									});

									var node_101 = $.sibling(node_100, 2);

									$.component(node_101, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(announcement).type;
											},
											onValueChange: (v) => v && ($.get(announcement).type = v),
											children: ($$anchor, $$slotProps) => {
												var fragment_56 = root_1();
												var node_102 = $.first_child(fragment_56);

												$.component(node_102, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														id: 'announcement-type',
														class: 'w-full',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_28 = $.text();

															$.template_effect(() => $.set_text(text_28, $.get(announcement).type));
															$.append($$anchor, text_28);
														},
														$$slots: { default: true }
													});
												});

												var node_103 = $.sibling(node_102, 2);

												$.component(node_103, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_58 = root_4();
															var node_104 = $.first_child(fragment_58);

															$.component(node_104, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	value: 'INFO',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_29 = $.text('INFO');

																		$.append($$anchor, text_29);
																	},
																	$$slots: { default: true }
																});
															});

															var node_105 = $.sibling(node_104, 2);

															$.component(node_105, () => Select.Item, ($$anchor, Select_Item_1) => {
																Select_Item_1($$anchor, {
																	value: 'WARNING',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_30 = $.text('WARNING');

																		$.append($$anchor, text_30);
																	},
																	$$slots: { default: true }
																});
															});

															var node_106 = $.sibling(node_105, 2);

															$.component(node_106, () => Select.Item, ($$anchor, Select_Item_2) => {
																Select_Item_2($$anchor, {
																	value: 'ERROR',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_31 = $.text('ERROR');

																		$.append($$anchor, text_31);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_58);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_56);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_16);
									$.reset(div_14);

									var div_17 = $.sibling(div_14, 2);
									var node_107 = $.child(div_17);

									Label(node_107, {
										for: 'announcement-message',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_32 = $.text('Message');

											$.append($$anchor, text_32);
										},
										$$slots: { default: true }
									});

									var node_108 = $.sibling(node_107, 2);

									Textarea(node_108, {
										id: 'announcement-message',
										placeholder: 'We are currently performing infrastructure upgrades.',
										rows: 4,
										get value() {
											return $.get(announcement).message;
										},

										set value($$value) {
											$.get(announcement).message = $$value;
										}
									});

									$.reset(div_17);

									var div_18 = $.sibling(div_17, 2);
									var div_19 = $.child(div_18);
									var node_109 = $.child(div_19);

									Label(node_109, {
										for: 'announcement-reshow',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_33 = $.text('Reshow After (hours)');

											$.append($$anchor, text_33);
										},
										$$slots: { default: true }
									});

									var node_110 = $.sibling(node_109, 2);

									Input(node_110, {
										id: 'announcement-reshow',
										type: 'number',
										min: '0',
										placeholder: 'Leave empty to never reshow automatically',
										get value() {
											return $.get(announcement).reshowAfterInHours;
										},

										set value($$value) {
											$.get(announcement).reshowAfterInHours = $$value;
										}
									});

									$.next(2);
									$.reset(div_19);

									var div_20 = $.sibling(div_19, 2);
									var node_111 = $.child(div_20);

									Label(node_111, {
										for: 'announcement-cta',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_34 = $.text('CTA URL (optional)');

											$.append($$anchor, text_34);
										},
										$$slots: { default: true }
									});

									var node_112 = $.sibling(node_111, 2);

									Input(node_112, {
										id: 'announcement-cta-url',
										placeholder: 'https://status.example.com/incident/123',
										get value() {
											return $.get(announcement).ctaURL;
										},

										set value($$value) {
											$.get(announcement).ctaURL = $$value;
										}
									});

									$.reset(div_20);

									var div_21 = $.sibling(div_20, 2);
									var node_113 = $.child(div_21);

									Label(node_113, {
										for: 'announcement-cta-text',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_35 = $.text('CTA Text (optional)');

											$.append($$anchor, text_35);
										},
										$$slots: { default: true }
									});

									var node_114 = $.sibling(node_113, 2);

									Input(node_114, {
										id: 'announcement-cta-text',
										placeholder: 'Learn more',
										get value() {
											return $.get(announcement).ctaText;
										},

										set value($$value) {
											$.get(announcement).ctaText = $$value;
										}
									});

									$.reset(div_21);
									$.reset(div_18);

									var div_22 = $.sibling(div_18, 2);
									var node_115 = $.child(div_22);

									Checkbox(node_115, {
										id: 'announcement-cancellable',
										get checked() {
											return $.get(announcement).cancellable;
										},
										onCheckedChange: (checked) => $.get(announcement).cancellable = checked === true
									});

									var div_23 = $.sibling(node_115, 2);
									var node_116 = $.child(div_23);

									Label(node_116, {
										for: 'announcement-cancellable',
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_36 = $.text('Cancellable');

											$.append($$anchor, text_36);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_23);
									$.reset(div_22);
									$.append($$anchor, fragment_55);
								},
								$$slots: { default: true }
							});
						});

						var node_117 = $.sibling(node_97, 2);

						$.component(node_117, () => Card.Footer, ($$anchor, Card_Footer_4) => {
							Card_Footer_4($$anchor, {
								class: 'flex justify-end border-t pt-6',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveAnnouncement,
										get disabled() {
											return $.get(savingAnnouncement);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_60 = root_17();
											var node_118 = $.first_child(fragment_60);

											{
												var consequent_5 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												$.if(node_118, ($$render) => {
													if ($.get(savingAnnouncement)) $$render(consequent_5);
												});
											}

											$.next();
											$.append($$anchor, fragment_60);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_53);
					},
					$$slots: { default: true }
				});
			});

			var node_119 = $.sibling(node_93, 2);

			$.component(node_119, () => Card.Root, ($$anchor, Card_Root_5) => {
				Card_Root_5($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_62 = root_4();
						var node_120 = $.first_child(fragment_62);

						$.component(node_120, () => Card.Header, ($$anchor, Card_Header_5) => {
							Card_Header_5($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_63 = root_1();
									var node_121 = $.first_child(fragment_63);

									$.component(node_121, () => Card.Title, ($$anchor, Card_Title_5) => {
										Card_Title_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_37 = $.text('Page Ordering');

												$.append($$anchor, text_37);
											},
											$$slots: { default: true }
										});
									});

									var node_122 = $.sibling(node_121, 2);

									$.component(node_122, () => Card.Description, ($$anchor, Card_Description_5) => {
										Card_Description_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_38 = $.text('Control the display order of pages in the page switcher. New pages will appear at the end of the list.');

												$.append($$anchor, text_38);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_63);
								},
								$$slots: { default: true }
							});
						});

						var node_123 = $.sibling(node_120, 2);

						$.component(node_123, () => Card.Content, ($$anchor, Card_Content_5) => {
							Card_Content_5($$anchor, {
								class: 'space-y-4 pt-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_64 = root_23();
									var div_24 = $.first_child(fragment_64);
									var node_124 = $.child(div_24);

									Checkbox(node_124, {
										id: 'page-ordering-enabled',
										get checked() {
											return $.get(pageOrderingEnabled);
										},
										onCheckedChange: (checked) => $.set(pageOrderingEnabled, checked === true)
									});

									var div_25 = $.sibling(node_124, 2);
									var node_125 = $.child(div_25);

									Label(node_125, {
										for: 'page-ordering-enabled',
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_39 = $.text('Enable custom page ordering');

											$.append($$anchor, text_39);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_25);
									$.reset(div_24);

									var node_126 = $.sibling(div_24, 2);

									{
										var consequent_6 = ($$anchor) => {
											var div_26 = root_18();
											var node_127 = $.child(div_26);

											Spinner(node_127, { class: 'h-5 w-5' });
											$.reset(div_26);
											$.append($$anchor, div_26);
										};

										var consequent_7 = ($$anchor) => {
											var p_2 = root_19();

											$.append($$anchor, p_2);
										};

										var alternate = ($$anchor) => {
											var div_27 = root_22();

											$.each(div_27, 23, () => $.get(displayPages), (page) => page.id, ($$anchor, page, index) => {
												var div_28 = root_21();
												var div_29 = $.child(div_28);
												var node_128 = $.child(div_29);

												GripVertical(node_128, { class: 'text-muted-foreground h-4 w-4 shrink-0' });

												var div_30 = $.sibling(node_128, 2);
												var p_3 = $.child(div_30);
												var text_40 = $.only_child(p_3, true);
												var p_4 = $.sibling(p_3, 2);
												var text_41 = $.only_child(p_4);

												$.reset(div_30);
												$.reset(div_29);

												var node_129 = $.sibling(div_29, 2);

												{
													var consequent_8 = ($$anchor) => {
														var div_31 = root_20();
														var node_130 = $.child(div_31);

														{
															let $0 = $.derived(() => $.get(index) === 0);

															Button(node_130, {
																variant: 'ghost',
																size: 'icon',
																class: 'h-8 w-8',
																get disabled() {
																	return $.get($0);
																},
																onclick: () => movePageUp($.get(index)),
																children: ($$anchor, $$slotProps) => {
																	ArrowUp($$anchor, { class: 'h-4 w-4' });
																},
																$$slots: { default: true }
															});
														}

														var node_131 = $.sibling(node_130, 2);

														{
															let $0 = $.derived(() => $.get(index) === $.get(displayPages).length - 1);

															Button(node_131, {
																variant: 'ghost',
																size: 'icon',
																class: 'h-8 w-8',
																get disabled() {
																	return $.get($0);
																},
																onclick: () => movePageDown($.get(index)),
																children: ($$anchor, $$slotProps) => {
																	ArrowDown($$anchor, { class: 'h-4 w-4' });
																},
																$$slots: { default: true }
															});
														}

														$.reset(div_31);
														$.append($$anchor, div_31);
													};

													$.if(node_129, ($$render) => {
														if ($.get(pageOrderingEnabled)) $$render(consequent_8);
													});
												}

												$.reset(div_28);

												$.template_effect(() => {
													$.set_class(div_28, 1, `flex items-center justify-between px-4 py-3 ${$.get(index) < $.get(displayPages).length - 1 ? 'border-b' : ''}`);
													$.set_text(text_40, $.get(page).page_title);
													$.set_text(text_41, `/${($.get(page).page_path || "") ?? ''}`);
												});

												$.append($$anchor, div_28);
											});

											$.reset(div_27);
											$.append($$anchor, div_27);
										};

										$.if(node_126, ($$render) => {
											if ($.get(loadingPages)) $$render(consequent_6); else if ($.get(allPages).length === 0) $$render(consequent_7, 1); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_64);
								},
								$$slots: { default: true }
							});
						});

						var node_132 = $.sibling(node_123, 2);

						$.component(node_132, () => Card.Footer, ($$anchor, Card_Footer_5) => {
							Card_Footer_5($$anchor, {
								class: 'flex justify-end border-t pt-6',
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => $.get(savingPageOrdering) || $.get(loadingPages));

										Button($$anchor, {
											onclick: savePageOrdering,
											get disabled() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_68 = root_24();
												var node_133 = $.first_child(fragment_68);

												{
													var consequent_9 = ($$anchor) => {
														Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
													};

													$.if(node_133, ($$render) => {
														if ($.get(savingPageOrdering)) $$render(consequent_9);
													});
												}

												$.next();
												$.append($$anchor, fragment_68);
											},
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_62);
					},
					$$slots: { default: true }
				});
			});

			var node_134 = $.sibling(node_119, 2);

			$.component(node_134, () => Card.Root, ($$anchor, Card_Root_6) => {
				Card_Root_6($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_70 = root_4();
						var node_135 = $.first_child(fragment_70);

						$.component(node_135, () => Card.Header, ($$anchor, Card_Header_6) => {
							Card_Header_6($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_71 = root_1();
									var node_136 = $.first_child(fragment_71);

									$.component(node_136, () => Card.Title, ($$anchor, Card_Title_6) => {
										Card_Title_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_42 = $.text('Custom CSS');

												$.append($$anchor, text_42);
											},
											$$slots: { default: true }
										});
									});

									var node_137 = $.sibling(node_136, 2);

									$.component(node_137, () => Card.Description, ($$anchor, Card_Description_6) => {
										Card_Description_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_72 = root_25();

												$.next(2);
												$.append($$anchor, fragment_72);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_71);
								},
								$$slots: { default: true }
							});
						});

						var node_138 = $.sibling(node_135, 2);

						$.component(node_138, () => Card.Content, ($$anchor, Card_Content_6) => {
							Card_Content_6($$anchor, {
								class: 'pt-6',
								children: ($$anchor, $$slotProps) => {
									var div_32 = root_2();
									var div_33 = $.child(div_32);
									var node_139 = $.child(div_33);

									{
										let $0 = $.derived(css);
										let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

										CodeMirror(node_139, {
											get lang() {
												return $.get($0);
											},

											get theme() {
												return $.get($1);
											},
											styles: { "&": { width: "100%", maxWidth: "100%", height: "320px" } },
											get value() {
												return $.get(customCSS);
											},

											set value($$value) {
												$.set(customCSS, $$value, true);
											}
										});
									}

									$.reset(div_33);
									$.reset(div_32);
									$.append($$anchor, div_32);
								},
								$$slots: { default: true }
							});
						});

						var node_140 = $.sibling(node_138, 2);

						$.component(node_140, () => Card.Footer, ($$anchor, Card_Footer_6) => {
							Card_Footer_6($$anchor, {
								class: 'flex justify-end border-t pt-6',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveCustomCSS,
										get disabled() {
											return $.get(savingCSS);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_74 = root_26();
											var node_141 = $.first_child(fragment_74);

											{
												var consequent_10 = ($$anchor) => {
													Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
												};

												$.if(node_141, ($$render) => {
													if ($.get(savingCSS)) $$render(consequent_10);
												});
											}

											$.next();
											$.append($$anchor, fragment_74);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_70);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}