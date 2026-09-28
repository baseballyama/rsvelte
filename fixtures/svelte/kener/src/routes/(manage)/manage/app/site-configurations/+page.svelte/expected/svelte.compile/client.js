import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
import GC from "$lib/global-constants.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import UploadIcon from "@lucide/svelte/icons/upload";
import XIcon from "@lucide/svelte/icons/x";
import ImageIcon from "@lucide/svelte/icons/image";
import Plus from "@lucide/svelte/icons/plus";
import CopyButton from "$lib/components/CopyButton.svelte";
import CopyIcon from "@lucide/svelte/icons/copy";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { page } from "$app/state";

var root = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p class="text-destructive text-xs">Invalid site URL. Please enter only protocol + domain (no path, query, or hash).</p>`);
var root_3 = $.from_html(`<p class="text-xs text-amber-600 dark:text-amber-400"> </p>`);
var root_4 = $.from_html(`<div class="grid gap-4 md:grid-cols-2"><div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">The name displayed in the header and browser tab</p></div> <div class="space-y-2"><!> <!> <!> <!> <p class="text-muted-foreground text-xs"> </p></div></div>`);
var root_5 = $.from_html(`<!> Saving...`, 1);
var root_6 = $.from_html(`<!> Save`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`<img alt="Logo" class="max-h-20 max-w-20 object-contain"/>`);
var root_9 = $.from_html(`<!> Uploading...`, 1);
var root_10 = $.from_html(`<!> Upload Logo`, 1);
var root_11 = $.from_html(`<p class="text-muted-foreground truncate text-xs"> </p>`);
var root_12 = $.from_html(`<div class="flex items-start gap-4"><div class="bg-muted flex h-24 w-24 items-center justify-center rounded-lg border"><!></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2"><!> <input id="logo-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"/> <!></div> <!></div></div>`);
var root_13 = $.from_html(`<img alt="Favicon" class="max-h-12 max-w-12 object-contain"/>`);
var root_14 = $.from_html(`<!> Upload Favicon`, 1);
var root_15 = $.from_html(`<div class="flex items-start gap-4"><div class="bg-muted flex h-16 w-16 items-center justify-center rounded-lg border"><!></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2"><!> <input id="favicon-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"/> <!></div> <!></div></div>`);
var root_16 = $.from_html(`<img alt="Social preview" class="h-full w-full rounded-lg object-cover"/>`);
var root_17 = $.from_html(`<!> Upload Social Preview`, 1);
var root_18 = $.from_html(`<p class="text-muted-foreground text-xs">Optional. Leave empty to use no social preview image.</p>`);
var root_19 = $.from_html(`<div class="flex items-start gap-4"><div class="bg-muted flex h-32 w-64 items-center justify-center rounded-lg border"><!></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2"><!> <input id="social-preview-image-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"/> <!></div> <!></div></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Overrides the default page title in search results</p></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Shown as the snippet text in search engine results</p></div>`, 1);
var root_20 = $.from_html(`<img alt="Icon" class="h-6 w-6 object-contain"/> <!>`, 1);
var root_21 = $.from_html(`<div class="flex items-end gap-2 rounded-lg border p-3"><div class="grid flex-1 gap-2 sm:grid-cols-3"><div class="space-y-1"><!> <!></div> <div class="space-y-1"><!> <!></div> <div class="space-y-1"><!> <div class="flex items-center gap-2"><!> <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"/></div></div></div> <!></div>`);
var root_22 = $.from_html(`<!> Add Navigation Item`, 1);
var root_23 = $.from_html(`<div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Show option to get embeddable status and uptime badges for the monitor</p></div> <!></div> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Show option to get iframe or script embed code for the monitor</p></div> <!></div> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Show an RSS feed link in the page header. The feed itself is always reachable at /rss.xml.</p></div> <!></div>`, 1);

var root_24 = $.from_html(
	`<div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">This will hide the pages dropdown from the menu.</p></div> <!></div> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">This sets <code>showSwitcher</code> to true and makes it read-only. It also enables brand icon link
              overwrite and calendar event updates for affected monitors. Global events (incidents and maintenances with <code>is_global=YES</code>) are still shown.</p></div> <!></div>`,
	1
);

var root_25 = $.from_html(`<div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Automatically remove status data older than retention days</p></div> <!></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Default is 90 days if not configured.</p></div>`, 1);
var root_26 = $.from_html(`<div class="grid gap-4 md:grid-cols-2"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div>`);
var root_27 = $.from_html(`<div class="border-muted ml-4 space-y-4 border-l-2 pl-4"><div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Display active incidents</p></div> <!></div> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Display recently resolved incidents</p></div> <!></div> <!></div>`);
var root_28 = $.from_html(`<div class="border-muted ml-4 space-y-4 border-l-2 pl-4"><div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Display active maintenance windows</p></div> <!></div> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Display completed maintenance windows</p></div> <!></div> <!> <div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Display scheduled maintenance windows</p></div> <!></div> <!></div>`);
var root_29 = $.from_html(`<div class="flex items-center justify-between rounded-lg border p-4"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Turn on to show events inline on the status page. Off shows them in the notification list.</p></div> <!></div> <div class="space-y-4"><div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Enable or disable incident display globally</p></div> <!></div> <!></div> <hr class="border-muted"/> <div class="space-y-4"><div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Enable or disable maintenance display globally</p></div> <!></div> <!></div>`, 1);
var root_30 = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div>`, 1);
var root_31 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);
var root_32 = $.from_html(`<!> `, 1);
var root_33 = $.from_html(`<p class="text-destructive text-xs">At least one URL is required for manual mode.</p>`);
var root_34 = $.from_html(`<div class="space-y-3"><!> <!> <!> <!></div>`);
var root_35 = $.from_html(`<div class="space-y-3"><!> <!> <p class="text-muted-foreground text-xs"><!></p></div> <!>`, 1);
var root_36 = $.from_html(`<!> Copy URL`, 1);
var root_37 = $.from_html(`<!> View`, 1);
var root_38 = $.from_html(`<div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">How many hours before the maintenance start time to send the reminder notification</p></div>`);
var root_39 = $.from_html(`<div class="space-y-4"><!> <div class="grid gap-4 sm:grid-cols-2"><div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Created</p> <p class="text-muted-foreground text-xs">When a maintenance is created</p></div> <!></div> <div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Reminder</p> <p class="text-muted-foreground text-xs">Before a scheduled maintenance starts</p></div> <!></div> <div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Started</p> <p class="text-muted-foreground text-xs">When a maintenance begins</p></div> <!></div> <div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Ended</p> <p class="text-muted-foreground text-xs">When a maintenance completes</p></div> <!></div></div></div> <!>`, 1);
var root_40 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_41 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Form state
	let loading = $.state(true);

	let savingSiteInfo = $.state(false);
	let savingLogo = $.state(false);
	let savingFavicon = $.state(false);
	let savingSocialPreviewImage = $.state(false);
	let savingNav = $.state(false);
	let savingSubMenuOptions = $.state(false);
	let savingGlobalPageVisibilitySettings = $.state(false);
	let savingDataRetentionPolicy = $.state(false);
	let savingEventDisplaySettings = $.state(false);
	let savingSitemap = $.state(false);
	let savingMaintenanceNotificationSettings = $.state(false);
	let uploadingLogo = $.state(false);
	let uploadingFavicon = $.state(false);
	let uploadingSocialPreviewImage = $.state(false);
	const defaultEventDisplaySettings = page.data.seedSiteData.eventDisplaySettings;

	// Site data
	let siteData = $.state($.proxy({
		siteName: "",
		siteURL: "",
		logo: "",
		favicon: "",
		socialPreviewImage: null
	}));

	// Navigation data
	let nav = $.state($.proxy([]));

	// Sub Menu Options
	let subMenuOptions = $.state($.proxy({
		showShareBadgeMonitor: true,
		showShareEmbedMonitor: true,
		showRssFeed: true
	}));

	const defaultGlobalPageVisibilitySettings = page.data.seedSiteData.globalPageVisibilitySettings;
	let globalPageVisibilitySettings = $.state($.proxy(structuredClone(defaultGlobalPageVisibilitySettings)));
	let dataRetentionPolicy = $.state($.proxy(page.data.seedSiteData.dataRetentionPolicy));
	let eventDisplaySettings = $.state($.proxy(structuredClone(defaultEventDisplaySettings)));
	let metaSiteTitle = $.state("");
	let metaSiteDescription = $.state("");
	const defaultSitemap = page.data.seedSiteData.sitemap;
	let sitemap = $.state($.proxy(structuredClone(defaultSitemap)));
	const defaultMaintenanceNotificationSettings = page.data.seedSiteData.globalMaintenanceNotificationSettings;
	let maintenanceNotificationSettings = $.state($.proxy(structuredClone(defaultMaintenanceNotificationSettings)));

	const sitemapURL = $.derived(() => $.get(siteData).siteURL
		? $.get(siteData).siteURL.replace(/\/$/, "") + clientResolver(resolve, "/sitemap.xml")
		: "");

	let currentOrigin = $.state("");

	function onForceExclusivityChange(checked) {
		const enabled = checked === true;

		$.get(globalPageVisibilitySettings).forceExclusivity = enabled;

		if (enabled) {
			$.get(globalPageVisibilitySettings).showSwitcher = true;
		}
	}

	function parseOriginOnlyURL(value) {
		try {
			const trimmedValue = value.trim();

			if (!trimmedValue) return null;

			const url = new URL(trimmedValue);

			if (!url.hostname || !["http:", "https:"].includes(url.protocol)) return null;
			if (url.username || url.password) return null;
			if (url.pathname !== "/" || url.search || url.hash) return null;

			return url;
		} catch {
			return null;
		}
	}

	const parsedSiteOriginURL = $.derived(() => parseOriginOnlyURL($.get(siteData).siteURL));
	const isOriginOnlySiteURL = $.derived(() => $.get(parsedSiteOriginURL) !== null);
	const enteredSiteOrigin = $.derived(() => $.get(parsedSiteOriginURL)?.origin ?? "");
	const hasOriginMismatch = $.derived(() => Boolean($.get(currentOrigin) && $.get(enteredSiteOrigin) && $.get(currentOrigin) !== $.get(enteredSiteOrigin)));

	// Validation
	const isValidSiteInfo = $.derived(() => $.get(siteData).siteName.trim().length > 0 && $.get(siteData).siteURL.trim().length > 0 && $.get(isOriginOnlySiteURL));

	async function fetchSiteData() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getAllSiteData" })
			});

			if (response.ok) {
				const data = await response.json();

				$.set(
					siteData,
					{
						siteName: data.siteName || "",
						siteURL: data.siteURL || "",
						logo: data.logo || "",
						favicon: data.favicon || "",
						socialPreviewImage: data.socialPreviewImage || null
					},
					true
				);

				if (data.nav) {
					$.set(
						nav,
						data.nav.map((item) => ({
							name: item.name || "",
							url: item.url || "",
							iconURL: item.iconURL || ""
						})),
						true
					);
				}

				if (data.subMenuOptions) {
					$.set(
						subMenuOptions,
						{
							showShareBadgeMonitor: data.subMenuOptions.showShareBadgeMonitor ?? true,
							showShareEmbedMonitor: data.subMenuOptions.showShareEmbedMonitor ?? true,
							showRssFeed: data.subMenuOptions.showRssFeed ?? true
						},
						true
					);
				}

				if (data.globalPageVisibilitySettings) {
					try {
						const parsed = typeof data.globalPageVisibilitySettings === "string"
							? JSON.parse(data.globalPageVisibilitySettings)
							: data.globalPageVisibilitySettings;

						$.set(
							globalPageVisibilitySettings,
							{
								...structuredClone(defaultGlobalPageVisibilitySettings),
								...parsed,
								showSwitcher: Boolean(parsed?.showSwitcher ?? true),
								forceExclusivity: Boolean(parsed?.forceExclusivity ?? false)
							},
							true
						);
					} catch {
						$.set(globalPageVisibilitySettings, structuredClone(defaultGlobalPageVisibilitySettings), true);
					}
				} else {
					$.set(globalPageVisibilitySettings, structuredClone(defaultGlobalPageVisibilitySettings), true);
				}

				$.set(
					dataRetentionPolicy,
					{
						enabled: data.dataRetentionPolicy?.enabled ?? true,
						retentionDays: data.dataRetentionPolicy?.retentionDays ?? 90
					},
					true
				);

				if (data.eventDisplaySettings) {
					try {
						$.set(eventDisplaySettings, parseEventDisplaySettings(data.eventDisplaySettings), true);
					} catch {
						$.set(eventDisplaySettings, structuredClone(defaultEventDisplaySettings), true);
					}
				} else {
					$.set(eventDisplaySettings, structuredClone(defaultEventDisplaySettings), true);
				}

				$.set(metaSiteTitle, data.metaSiteTitle || "", true);
				$.set(metaSiteDescription, data.metaSiteDescription || "", true);

				if (data.sitemap) {
					try {
						const parsed = typeof data.sitemap === "string" ? JSON.parse(data.sitemap) : data.sitemap;

						$.set(
							sitemap,
							{
								mode: parsed?.mode ?? "auto",
								urls: Array.isArray(parsed?.urls) ? parsed.urls : []
							},
							true
						);
					} catch {
						$.set(sitemap, structuredClone(defaultSitemap), true);
					}
				} else {
					$.set(sitemap, structuredClone(defaultSitemap), true);
				}

				if (data.globalMaintenanceNotificationSettings) {
					try {
						const parsed = typeof data.globalMaintenanceNotificationSettings === "string"
							? JSON.parse(data.globalMaintenanceNotificationSettings)
							: data.globalMaintenanceNotificationSettings;

						$.set(
							maintenanceNotificationSettings,
							{
								...structuredClone(defaultMaintenanceNotificationSettings),
								...parsed,
								event_types: {
									...structuredClone(defaultMaintenanceNotificationSettings.event_types),
									...parsed?.event_types
								}
							},
							true
						);
					} catch {
						$.set(maintenanceNotificationSettings, structuredClone(defaultMaintenanceNotificationSettings), true);
					}
				} else {
					$.set(maintenanceNotificationSettings, structuredClone(defaultMaintenanceNotificationSettings), true);
				}
			}
		} catch(e) {
			toast.error("Failed to load site data");
		} finally {
			$.set(loading, false);
		}
	}

	async function saveSiteInfo() {
		if (!$.get(isValidSiteInfo)) return;

		$.set(savingSiteInfo, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: {
						siteName: $.get(siteData).siteName,
						siteURL: $.get(siteData).siteURL
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Site information saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save site information");
		} finally {
			$.set(savingSiteInfo, false);
		}
	}

	async function saveLogo() {
		$.set(savingLogo, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { logo: $.get(siteData).logo }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Logo saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save logo");
		} finally {
			$.set(savingLogo, false);
		}
	}

	async function saveFavicon() {
		$.set(savingFavicon, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { favicon: $.get(siteData).favicon }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Favicon saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save favicon");
		} finally {
			$.set(savingFavicon, false);
		}
	}

	async function saveSocialPreviewImage() {
		$.set(savingSocialPreviewImage, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: {
						socialPreviewImage: $.get(siteData).socialPreviewImage,
						metaSiteTitle: $.get(metaSiteTitle),
						metaSiteDescription: $.get(metaSiteDescription)
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Social preview & SEO settings saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save social preview & SEO settings");
		} finally {
			$.set(savingSocialPreviewImage, false);
		}
	}

	async function saveNavigation() {
		$.set(savingNav, true);

		try {
			const cleanNav = $.get(nav).map((item) => ({ name: item.name, url: item.url, iconURL: item.iconURL }));

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { nav: JSON.stringify(cleanNav) }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Navigation saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save navigation");
		} finally {
			$.set(savingNav, false);
		}
	}

	async function saveSubMenuOptions() {
		$.set(savingSubMenuOptions, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { subMenuOptions: JSON.stringify($.get(subMenuOptions)) }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Sub menu options saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save sub menu options");
		} finally {
			$.set(savingSubMenuOptions, false);
		}
	}

	async function saveGlobalPageVisibilitySettings() {
		$.set(savingGlobalPageVisibilitySettings, true);

		try {
			const payload = {
				showSwitcher: $.get(globalPageVisibilitySettings).forceExclusivity
					? true
					: $.get(globalPageVisibilitySettings).showSwitcher,
				forceExclusivity: $.get(globalPageVisibilitySettings).forceExclusivity
			};

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { globalPageVisibilitySettings: JSON.stringify(payload) }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.set(globalPageVisibilitySettings, payload, true);
				toast.success("Global page visibility settings saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save global page visibility settings");
		} finally {
			$.set(savingGlobalPageVisibilitySettings, false);
		}
	}

	async function saveDataRetentionPolicy() {
		$.set(savingDataRetentionPolicy, true);

		try {
			const safeRetentionDays = Math.max(1, Number($.get(dataRetentionPolicy).retentionDays) || 90);

			const payload = {
				enabled: $.get(dataRetentionPolicy).enabled,
				retentionDays: safeRetentionDays
			};

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { dataRetentionPolicy: JSON.stringify(payload) }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.get(dataRetentionPolicy).retentionDays = safeRetentionDays;
				toast.success("Data retention policy saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save data retention policy");
		} finally {
			$.set(savingDataRetentionPolicy, false);
		}
	}

	async function saveEventDisplaySettings() {
		$.set(savingEventDisplaySettings, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: {
						eventDisplaySettings: JSON.stringify($.get(eventDisplaySettings))
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Event display settings saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save event display settings");
		} finally {
			$.set(savingEventDisplaySettings, false);
		}
	}

	function parseEventDisplaySettings(value) {
		const parsed = typeof value === "string" ? JSON.parse(value) : value;
		const defaults = structuredClone(defaultEventDisplaySettings);

		return {
			showInlineEvents: typeof parsed?.showInlineEvents === "boolean" ? parsed.showInlineEvents : defaults.showInlineEvents,
			incidents: {
				...defaults.incidents,
				...parsed?.incidents,
				ongoing: { ...defaults.incidents.ongoing, ...parsed?.incidents?.ongoing },
				resolved: {
					...defaults.incidents.resolved,
					...parsed?.incidents?.resolved
				}
			},
			maintenances: {
				...defaults.maintenances,
				...parsed?.maintenances,
				ongoing: {
					...defaults.maintenances.ongoing,
					...parsed?.maintenances?.ongoing
				},
				past: { ...defaults.maintenances.past, ...parsed?.maintenances?.past },
				upcoming: {
					...defaults.maintenances.upcoming,
					...parsed?.maintenances?.upcoming
				}
			}
		};
	}

	function addSitemapUrl() {
		$.get(sitemap).urls = [...$.get(sitemap).urls, { loc: "" }];
	}

	function removeSitemapUrl(index) {
		$.get(sitemap).urls = $.get(sitemap).urls.filter((_, i) => i !== index);
	}

	const isValidSitemap = $.derived(() => $.get(sitemap).mode !== "manual" || $.get(sitemap).urls.length > 0 && $.get(sitemap).urls.every((u) => u.loc.trim().length > 0));

	async function saveSitemap() {
		if (!$.get(isValidSitemap)) return;

		$.set(savingSitemap, true);

		try {
			const payload = {
				mode: $.get(sitemap).mode,
				urls: $.get(sitemap).mode !== "off"
					? $.get(sitemap).urls.map((u) => ({ loc: u.loc.trim() })).filter((u) => u.loc.length > 0)
					: []
			};

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { sitemap: JSON.stringify(payload) }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Sitemap settings saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save sitemap settings");
		} finally {
			$.set(savingSitemap, false);
		}
	}

	async function saveMaintenanceNotificationSettings() {
		const bufferHours = Number($.get(maintenanceNotificationSettings).reminder_buffer_hours);

		if (!Number.isFinite(bufferHours) || bufferHours < 1) {
			toast.error("Reminder buffer hours must be a number of at least 1");

			return;
		}

		$.set(savingMaintenanceNotificationSettings, true);

		try {
			const payload = {
				event_types: {
					created: $.get(maintenanceNotificationSettings).event_types.created,
					reminder: $.get(maintenanceNotificationSettings).event_types.reminder,
					started: $.get(maintenanceNotificationSettings).event_types.started,
					ended: $.get(maintenanceNotificationSettings).event_types.ended
				},
				reminder_buffer_hours: Math.max(1, Math.floor(bufferHours))
			};

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: {
						globalMaintenanceNotificationSettings: JSON.stringify(payload)
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.get(maintenanceNotificationSettings).reminder_buffer_hours = payload.reminder_buffer_hours;
				toast.success("Maintenance notification settings saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save maintenance notification settings");
		} finally {
			$.set(savingMaintenanceNotificationSettings, false);
		}
	}

	async function handleImageUpload(event, type) {
		const input = event.target;
		const file = input.files?.[0];

		if (!file) return;

		// Validate file type
		const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type. Allowed: PNG, JPG, SVG, WebP");

			return;
		}

		// Validate file size (max 2MB)
		if (file.size > GC.MAX_UPLOAD_BYTES) {
			toast.error(`File too large. Maximum size is ${GC.MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);

			return;
		}

		if (type === "logo") {
			$.set(uploadingLogo, true);
		} else if (type === "favicon") {
			$.set(uploadingFavicon, true);
		} else {
			$.set(uploadingSocialPreviewImage, true);
		}

		try {
			// Convert file to base64
			const base64 = await fileToBase64(file);

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "uploadImage",
					data: {
						base64,
						mimeType: file.type,
						fileName: file.name,
						maxWidth: type === "favicon" ? 64 : type === "socialPreviewImage" ? 640 : 256,
						maxHeight: type === "favicon" ? 64 : type === "socialPreviewImage" ? 320 : 256,
						forceDimensions: type === "socialPreviewImage",
						prefix: `${type}_`
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				if (type === "logo") {
					$.get(siteData).logo = result.url;
				} else if (type === "socialPreviewImage") {
					$.get(siteData).socialPreviewImage = result.url;
				} else {
					$.get(siteData).favicon = result.url;
				}

				toast.success(`${type === "logo"
					? "Logo"
					: type === "favicon" ? "Favicon" : "Social preview image"} uploaded successfully`);
			}
		} catch(e) {
			toast.error(`Failed to upload ${type}`);
		} finally {
			if (type === "logo") {
				$.set(uploadingLogo, false);
			} else if (type === "favicon") {
				$.set(uploadingFavicon, false);
			} else {
				$.set(uploadingSocialPreviewImage, false);
			}

			// Reset input
			input.value = "";
		}
	}

	async function handleNavIconUpload(event, index) {
		const input = event.target;
		const file = input.files?.[0];

		if (!file) return;

		if (file.size > 102400) {
			toast.error("File size should be less than 100KB");

			return;
		}

		$.get(nav)[index].uploading = true;

		try {
			const base64 = await fileToBase64(file);

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "uploadImage",
					data: {
						base64,
						mimeType: file.type,
						fileName: file.name,
						maxWidth: 32,
						maxHeight: 32,
						prefix: "navicon_"
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.get(nav)[index].iconURL = result.url;
			}
		} catch(e) {
			toast.error("Failed to upload icon");
		} finally {
			$.get(nav)[index].uploading = false;
		}
	}

	function fileToBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.readAsDataURL(file);

			reader.onload = () => {
				const result = reader.result;

				// Remove the data URI prefix (e.g., "data:image/png;base64,")
				const base64 = result.split(",")[1];

				resolve(base64);
			};

			reader.onerror = (error) => reject(error);
		});
	}

	function clearImage(type) {
		if (type === "logo") {
			$.get(siteData).logo = "";
		} else if (type === "favicon") {
			$.get(siteData).favicon = "";
		} else {
			$.get(siteData).socialPreviewImage = null;
		}
	}

	function addNavItem() {
		$.set(nav, [...$.get(nav), { name: "", url: "", iconURL: "" }], true);
	}

	function removeNavItem(index) {
		$.set(nav, $.get(nav).filter((_, i) => i !== index), true);
	}

	onMount(() => {
		$.set(currentOrigin, window.location.origin, true);
		void fetchSiteData();
	});

	var div = root_41();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, {});
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_21 = ($$anchor) => {
			var fragment = root_40();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_7();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Site Information');

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

												var text_1 = $.text('Basic information about your status page');

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
								class: 'space-y-4',
								children: ($$anchor, $$slotProps) => {
									var div_2 = root_4();
									var div_3 = $.child(div_2);
									var node_7 = $.child(div_3);

									Label(node_7, {
										for: 'siteName',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Site Name *');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									Input(node_8, {
										id: 'siteName',
										type: 'text',
										placeholder: 'My Status Page',
										get value() {
											return $.get(siteData).siteName;
										},

										set value($$value) {
											$.get(siteData).siteName = $$value;
										}
									});

									$.next(2);
									$.reset(div_3);

									var div_4 = $.sibling(div_3, 2);
									var node_9 = $.child(div_4);

									Label(node_9, {
										for: 'siteURL',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Site URL *');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Input(node_10, {
										id: 'siteURL',
										type: 'url',
										placeholder: 'https://status.example.com',
										get value() {
											return $.get(siteData).siteURL;
										},

										set value($$value) {
											$.get(siteData).siteURL = $$value;
										}
									});

									var node_11 = $.sibling(node_10, 2);

									{
										var consequent_1 = ($$anchor) => {
											var p = root_2();

											$.append($$anchor, p);
										};

										var d = $.derived(() => $.get(siteData).siteURL.trim().length > 0 && !$.get(isOriginOnlySiteURL));

										$.if(node_11, ($$render) => {
											if ($.get(d)) $$render(consequent_1);
										});
									}

									var node_12 = $.sibling(node_11, 2);

									{
										var consequent_2 = ($$anchor) => {
											var p_1 = root_3();
											var text_4 = $.only_child(p_1);

											$.template_effect(() => $.set_text(text_4, `Warning: Entered origin (${$.get(enteredSiteOrigin) ?? ''}) does not match current origin (${$.get(currentOrigin) ?? ''}).`));
											$.append($$anchor, p_1);
										};

										var d_1 = $.derived(() => $.get(siteData).siteURL.trim().length > 0 && $.get(isOriginOnlySiteURL) && $.get(hasOriginMismatch));

										$.if(node_12, ($$render) => {
											if ($.get(d_1)) $$render(consequent_2);
										});
									}

									var p_2 = $.sibling(node_12, 2);
									var text_5 = $.only_child(p_2);

									$.reset(div_4);
									$.reset(div_2);

									$.template_effect(($0) => $.set_text(text_5, `Effective URL: ${$0 ?? ''}`), [
										() => ($.get(isOriginOnlySiteURL) ? $.get(enteredSiteOrigin) : $.get(siteData).siteURL) + clientResolver(resolve, "/")
									]);

									$.append($$anchor, div_2);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_6, 2);

						$.component(node_13, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => $.get(savingSiteInfo) || !$.get(isValidSiteInfo));

										Button($$anchor, {
											onclick: saveSiteInfo,
											get disabled() {
												return $.get($0);
											},
											class: 'cursor-pointer',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_14 = $.first_child(fragment_4);

												{
													var consequent_3 = ($$anchor) => {
														var fragment_5 = root_5();
														var node_15 = $.first_child(fragment_5);

														Loader(node_15, { class: 'h-4 w-4 animate-spin' });
														$.next();
														$.append($$anchor, fragment_5);
													};

													var alternate = ($$anchor) => {
														var fragment_6 = root_6();
														var node_16 = $.first_child(fragment_6);

														SaveIcon(node_16, { class: 'h-4 w-4' });
														$.next();
														$.append($$anchor, fragment_6);
													};

													$.if(node_14, ($$render) => {
														if ($.get(savingSiteInfo)) $$render(consequent_3); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_17 = $.sibling(node_2, 2);

			$.component(node_17, () => Card.Root, ($$anchor, Card_Root_1) => {
				Card_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_7();
						var node_18 = $.first_child(fragment_7);

						$.component(node_18, () => Card.Header, ($$anchor, Card_Header_1) => {
							Card_Header_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_19 = $.first_child(fragment_8);

									$.component(node_19, () => Card.Title, ($$anchor, Card_Title_1) => {
										Card_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Logo');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => Card.Description, ($$anchor, Card_Description_1) => {
										Card_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Upload your site logo (max 256x256px, PNG/JPG/SVG/WebP)');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_21 = $.sibling(node_18, 2);

						$.component(node_21, () => Card.Content, ($$anchor, Card_Content_1) => {
							Card_Content_1($$anchor, {
								class: 'space-y-4',
								children: ($$anchor, $$slotProps) => {
									var div_5 = root_12();
									var div_6 = $.child(div_5);
									var node_22 = $.child(div_6);

									{
										var consequent_4 = ($$anchor) => {
											var img = root_8();

											$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => clientResolver(resolve, $.get(siteData).logo)]);
											$.append($$anchor, img);
										};

										var alternate_1 = ($$anchor) => {
											ImageIcon($$anchor, { class: 'text-muted-foreground h-8 w-8' });
										};

										$.if(node_22, ($$render) => {
											if ($.get(siteData).logo) $$render(consequent_4); else $$render(alternate_1, -1);
										});
									}

									$.reset(div_6);

									var div_7 = $.sibling(div_6, 2);
									var div_8 = $.child(div_7);
									var node_23 = $.child(div_8);

									Button(node_23, {
										variant: 'outline',
										get disabled() {
											return $.get(uploadingLogo);
										},
										onclick: () => document.getElementById("logo-input")?.click(),
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = $.comment();
											var node_24 = $.first_child(fragment_10);

											{
												var consequent_5 = ($$anchor) => {
													var fragment_11 = root_9();
													var node_25 = $.first_child(fragment_11);

													Loader(node_25, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_11);
												};

												var alternate_2 = ($$anchor) => {
													var fragment_12 = root_10();
													var node_26 = $.first_child(fragment_12);

													UploadIcon(node_26, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_12);
												};

												$.if(node_24, ($$render) => {
													if ($.get(uploadingLogo)) $$render(consequent_5); else $$render(alternate_2, -1);
												});
											}

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									var input_1 = $.sibling(node_23, 2);
									var node_27 = $.sibling(input_1, 2);

									{
										var consequent_6 = ($$anchor) => {
											Button($$anchor, {
												variant: 'ghost',
												size: 'icon',
												onclick: () => clearImage("logo"),
												children: ($$anchor, $$slotProps) => {
													XIcon($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										};

										$.if(node_27, ($$render) => {
											if ($.get(siteData).logo) $$render(consequent_6);
										});
									}

									$.reset(div_8);

									var node_28 = $.sibling(div_8, 2);

									{
										var consequent_7 = ($$anchor) => {
											var p_3 = root_11();
											var text_8 = $.only_child(p_3, true);

											$.template_effect(() => $.set_text(text_8, $.get(siteData).logo));
											$.append($$anchor, p_3);
										};

										$.if(node_28, ($$render) => {
											if ($.get(siteData).logo) $$render(consequent_7);
										});
									}

									$.reset(div_7);
									$.reset(div_5);
									$.template_effect(() => input_1.disabled = $.get(uploadingLogo));
									$.delegated('change', input_1, (e) => handleImageUpload(e, "logo"));
									$.append($$anchor, div_5);
								},
								$$slots: { default: true }
							});
						});

						var node_29 = $.sibling(node_21, 2);

						$.component(node_29, () => Card.Footer, ($$anchor, Card_Footer_1) => {
							Card_Footer_1($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveLogo,
										get disabled() {
											return $.get(savingLogo);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_16 = $.comment();
											var node_30 = $.first_child(fragment_16);

											{
												var consequent_8 = ($$anchor) => {
													var fragment_17 = root_5();
													var node_31 = $.first_child(fragment_17);

													Loader(node_31, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_17);
												};

												var alternate_3 = ($$anchor) => {
													var fragment_18 = root_6();
													var node_32 = $.first_child(fragment_18);

													SaveIcon(node_32, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_18);
												};

												$.if(node_30, ($$render) => {
													if ($.get(savingLogo)) $$render(consequent_8); else $$render(alternate_3, -1);
												});
											}

											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_33 = $.sibling(node_17, 2);

			$.component(node_33, () => Card.Root, ($$anchor, Card_Root_2) => {
				Card_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_19 = root_7();
						var node_34 = $.first_child(fragment_19);

						$.component(node_34, () => Card.Header, ($$anchor, Card_Header_2) => {
							Card_Header_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root_1();
									var node_35 = $.first_child(fragment_20);

									$.component(node_35, () => Card.Title, ($$anchor, Card_Title_2) => {
										Card_Title_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Favicon');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_36 = $.sibling(node_35, 2);

									$.component(node_36, () => Card.Description, ($$anchor, Card_Description_2) => {
										Card_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Upload your site favicon (max 64x64px, PNG/JPG/SVG/WebP)');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});
						});

						var node_37 = $.sibling(node_34, 2);

						$.component(node_37, () => Card.Content, ($$anchor, Card_Content_2) => {
							Card_Content_2($$anchor, {
								class: 'space-y-4',
								children: ($$anchor, $$slotProps) => {
									var div_9 = root_15();
									var div_10 = $.child(div_9);
									var node_38 = $.child(div_10);

									{
										var consequent_9 = ($$anchor) => {
											var img_1 = root_13();

											$.template_effect(($0) => $.set_attribute(img_1, 'src', $0), [() => clientResolver(resolve, $.get(siteData).favicon)]);
											$.append($$anchor, img_1);
										};

										var alternate_4 = ($$anchor) => {
											ImageIcon($$anchor, { class: 'text-muted-foreground h-6 w-6' });
										};

										$.if(node_38, ($$render) => {
											if ($.get(siteData).favicon) $$render(consequent_9); else $$render(alternate_4, -1);
										});
									}

									$.reset(div_10);

									var div_11 = $.sibling(div_10, 2);
									var div_12 = $.child(div_11);
									var node_39 = $.child(div_12);

									Button(node_39, {
										variant: 'outline',
										get disabled() {
											return $.get(uploadingFavicon);
										},
										onclick: () => document.getElementById("favicon-input")?.click(),
										children: ($$anchor, $$slotProps) => {
											var fragment_22 = $.comment();
											var node_40 = $.first_child(fragment_22);

											{
												var consequent_10 = ($$anchor) => {
													var fragment_23 = root_9();
													var node_41 = $.first_child(fragment_23);

													Loader(node_41, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_23);
												};

												var alternate_5 = ($$anchor) => {
													var fragment_24 = root_14();
													var node_42 = $.first_child(fragment_24);

													UploadIcon(node_42, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_24);
												};

												$.if(node_40, ($$render) => {
													if ($.get(uploadingFavicon)) $$render(consequent_10); else $$render(alternate_5, -1);
												});
											}

											$.append($$anchor, fragment_22);
										},
										$$slots: { default: true }
									});

									var input_2 = $.sibling(node_39, 2);
									var node_43 = $.sibling(input_2, 2);

									{
										var consequent_11 = ($$anchor) => {
											Button($$anchor, {
												variant: 'ghost',
												size: 'icon',
												onclick: () => clearImage("favicon"),
												children: ($$anchor, $$slotProps) => {
													XIcon($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										};

										$.if(node_43, ($$render) => {
											if ($.get(siteData).favicon) $$render(consequent_11);
										});
									}

									$.reset(div_12);

									var node_44 = $.sibling(div_12, 2);

									{
										var consequent_12 = ($$anchor) => {
											var p_4 = root_11();
											var text_11 = $.only_child(p_4, true);

											$.template_effect(() => $.set_text(text_11, $.get(siteData).favicon));
											$.append($$anchor, p_4);
										};

										$.if(node_44, ($$render) => {
											if ($.get(siteData).favicon) $$render(consequent_12);
										});
									}

									$.reset(div_11);
									$.reset(div_9);
									$.template_effect(() => input_2.disabled = $.get(uploadingFavicon));
									$.delegated('change', input_2, (e) => handleImageUpload(e, "favicon"));
									$.append($$anchor, div_9);
								},
								$$slots: { default: true }
							});
						});

						var node_45 = $.sibling(node_37, 2);

						$.component(node_45, () => Card.Footer, ($$anchor, Card_Footer_2) => {
							Card_Footer_2($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveFavicon,
										get disabled() {
											return $.get(savingFavicon);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_28 = $.comment();
											var node_46 = $.first_child(fragment_28);

											{
												var consequent_13 = ($$anchor) => {
													var fragment_29 = root_5();
													var node_47 = $.first_child(fragment_29);

													Loader(node_47, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_29);
												};

												var alternate_6 = ($$anchor) => {
													var fragment_30 = root_6();
													var node_48 = $.first_child(fragment_30);

													SaveIcon(node_48, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_30);
												};

												$.if(node_46, ($$render) => {
													if ($.get(savingFavicon)) $$render(consequent_13); else $$render(alternate_6, -1);
												});
											}

											$.append($$anchor, fragment_28);
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

			var node_49 = $.sibling(node_33, 2);

			$.component(node_49, () => Card.Root, ($$anchor, Card_Root_3) => {
				Card_Root_3($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_31 = root_7();
						var node_50 = $.first_child(fragment_31);

						$.component(node_50, () => Card.Header, ($$anchor, Card_Header_3) => {
							Card_Header_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_32 = root_1();
									var node_51 = $.first_child(fragment_32);

									$.component(node_51, () => Card.Title, ($$anchor, Card_Title_3) => {
										Card_Title_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Social Preview & SEO');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									var node_52 = $.sibling(node_51, 2);

									$.component(node_52, () => Card.Description, ($$anchor, Card_Description_3) => {
										Card_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('Configure social preview image and meta tags for search engines');

												$.append($$anchor, text_13);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_32);
								},
								$$slots: { default: true }
							});
						});

						var node_53 = $.sibling(node_50, 2);

						$.component(node_53, () => Card.Content, ($$anchor, Card_Content_3) => {
							Card_Content_3($$anchor, {
								class: 'space-y-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_33 = root_19();
									var div_13 = $.first_child(fragment_33);
									var div_14 = $.child(div_13);
									var node_54 = $.child(div_14);

									{
										var consequent_14 = ($$anchor) => {
											var img_2 = root_16();

											$.template_effect(($0) => $.set_attribute(img_2, 'src', $0), [
												() => clientResolver(resolve, $.get(siteData).socialPreviewImage)
											]);

											$.append($$anchor, img_2);
										};

										var alternate_7 = ($$anchor) => {
											ImageIcon($$anchor, { class: 'text-muted-foreground h-8 w-8' });
										};

										$.if(node_54, ($$render) => {
											if ($.get(siteData).socialPreviewImage) $$render(consequent_14); else $$render(alternate_7, -1);
										});
									}

									$.reset(div_14);

									var div_15 = $.sibling(div_14, 2);
									var div_16 = $.child(div_15);
									var node_55 = $.child(div_16);

									Button(node_55, {
										variant: 'outline',
										get disabled() {
											return $.get(uploadingSocialPreviewImage);
										},
										onclick: () => document.getElementById("social-preview-image-input")?.click(),
										children: ($$anchor, $$slotProps) => {
											var fragment_35 = $.comment();
											var node_56 = $.first_child(fragment_35);

											{
												var consequent_15 = ($$anchor) => {
													var fragment_36 = root_9();
													var node_57 = $.first_child(fragment_36);

													Loader(node_57, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_36);
												};

												var alternate_8 = ($$anchor) => {
													var fragment_37 = root_17();
													var node_58 = $.first_child(fragment_37);

													UploadIcon(node_58, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_37);
												};

												$.if(node_56, ($$render) => {
													if ($.get(uploadingSocialPreviewImage)) $$render(consequent_15); else $$render(alternate_8, -1);
												});
											}

											$.append($$anchor, fragment_35);
										},
										$$slots: { default: true }
									});

									var input_3 = $.sibling(node_55, 2);
									var node_59 = $.sibling(input_3, 2);

									{
										var consequent_16 = ($$anchor) => {
											Button($$anchor, {
												variant: 'ghost',
												size: 'icon',
												onclick: () => clearImage("socialPreviewImage"),
												children: ($$anchor, $$slotProps) => {
													XIcon($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										};

										$.if(node_59, ($$render) => {
											if ($.get(siteData).socialPreviewImage) $$render(consequent_16);
										});
									}

									$.reset(div_16);

									var node_60 = $.sibling(div_16, 2);

									{
										var consequent_17 = ($$anchor) => {
											var p_5 = root_11();
											var text_14 = $.only_child(p_5, true);

											$.template_effect(() => $.set_text(text_14, $.get(siteData).socialPreviewImage));
											$.append($$anchor, p_5);
										};

										var alternate_9 = ($$anchor) => {
											var p_6 = root_18();

											$.append($$anchor, p_6);
										};

										$.if(node_60, ($$render) => {
											if ($.get(siteData).socialPreviewImage) $$render(consequent_17); else $$render(alternate_9, -1);
										});
									}

									$.reset(div_15);
									$.reset(div_13);

									var div_17 = $.sibling(div_13, 2);
									var node_61 = $.child(div_17);

									Label(node_61, {
										for: 'metaSiteTitle',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('Meta Title');

											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});

									var node_62 = $.sibling(node_61, 2);

									Input(node_62, {
										id: 'metaSiteTitle',
										type: 'text',
										placeholder: 'Custom page title for search engines',
										get value() {
											return $.get(metaSiteTitle);
										},

										set value($$value) {
											$.set(metaSiteTitle, $$value, true);
										}
									});

									$.next(2);
									$.reset(div_17);

									var div_18 = $.sibling(div_17, 2);
									var node_63 = $.child(div_18);

									Label(node_63, {
										for: 'metaSiteDescription',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Meta Description');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									var node_64 = $.sibling(node_63, 2);

									Textarea(node_64, {
										id: 'metaSiteDescription',
										placeholder: 'Custom description for search engines',
										rows: 3,
										get value() {
											return $.get(metaSiteDescription);
										},

										set value($$value) {
											$.set(metaSiteDescription, $$value, true);
										}
									});

									$.next(2);
									$.reset(div_18);
									$.template_effect(() => input_3.disabled = $.get(uploadingSocialPreviewImage));
									$.delegated('change', input_3, (e) => handleImageUpload(e, "socialPreviewImage"));
									$.append($$anchor, fragment_33);
								},
								$$slots: { default: true }
							});
						});

						var node_65 = $.sibling(node_53, 2);

						$.component(node_65, () => Card.Footer, ($$anchor, Card_Footer_3) => {
							Card_Footer_3($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveSocialPreviewImage,
										get disabled() {
											return $.get(savingSocialPreviewImage);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_41 = $.comment();
											var node_66 = $.first_child(fragment_41);

											{
												var consequent_18 = ($$anchor) => {
													var fragment_42 = root_5();
													var node_67 = $.first_child(fragment_42);

													Loader(node_67, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_42);
												};

												var alternate_10 = ($$anchor) => {
													var fragment_43 = root_6();
													var node_68 = $.first_child(fragment_43);

													SaveIcon(node_68, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_43);
												};

												$.if(node_66, ($$render) => {
													if ($.get(savingSocialPreviewImage)) $$render(consequent_18); else $$render(alternate_10, -1);
												});
											}

											$.append($$anchor, fragment_41);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_31);
					},
					$$slots: { default: true }
				});
			});

			var node_69 = $.sibling(node_49, 2);

			$.component(node_69, () => Card.Root, ($$anchor, Card_Root_4) => {
				Card_Root_4($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_44 = root_7();
						var node_70 = $.first_child(fragment_44);

						$.component(node_70, () => Card.Header, ($$anchor, Card_Header_4) => {
							Card_Header_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_45 = root_1();
									var node_71 = $.first_child(fragment_45);

									$.component(node_71, () => Card.Title, ($$anchor, Card_Title_4) => {
										Card_Title_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_17 = $.text('Navigation Menu');

												$.append($$anchor, text_17);
											},
											$$slots: { default: true }
										});
									});

									var node_72 = $.sibling(node_71, 2);

									$.component(node_72, () => Card.Description, ($$anchor, Card_Description_4) => {
										Card_Description_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_18 = $.text('Add custom navigation links to your status page header');

												$.append($$anchor, text_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_45);
								},
								$$slots: { default: true }
							});
						});

						var node_73 = $.sibling(node_70, 2);

						$.component(node_73, () => Card.Content, ($$anchor, Card_Content_4) => {
							Card_Content_4($$anchor, {
								class: 'space-y-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_46 = root_1();
									var node_74 = $.first_child(fragment_46);

									$.each(node_74, 17, () => $.get(nav), $.index, ($$anchor, item, index) => {
										var div_19 = root_21();
										var div_20 = $.child(div_19);
										var div_21 = $.child(div_20);
										var node_75 = $.child(div_21);

										Label(node_75, {
											for: `nav-name-${index}`,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_19 = $.text('Name');

												$.append($$anchor, text_19);
											},
											$$slots: { default: true }
										});

										var node_76 = $.sibling(node_75, 2);

										Input(node_76, {
											id: `nav-name-${index}`,
											type: 'text',
											placeholder: 'Documentation',
											get value() {
												return $.get(item).name;
											},

											set value($$value) {
												($.get(item).name = $$value);
											}
										});

										$.reset(div_21);

										var div_22 = $.sibling(div_21, 2);
										var node_77 = $.child(div_22);

										Label(node_77, {
											for: `nav-url-${index}`,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_20 = $.text('URL');

												$.append($$anchor, text_20);
											},
											$$slots: { default: true }
										});

										var node_78 = $.sibling(node_77, 2);

										Input(node_78, {
											id: `nav-url-${index}`,
											type: 'text',
											placeholder: 'https://docs.example.com',
											get value() {
												return $.get(item).url;
											},

											set value($$value) {
												($.get(item).url = $$value);
											}
										});

										$.reset(div_22);

										var div_23 = $.sibling(div_22, 2);
										var node_79 = $.child(div_23);

										Label(node_79, {
											for: `nav-icon-${index}`,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_21 = $.text('Icon');

												$.append($$anchor, text_21);
											},
											$$slots: { default: true }
										});

										var div_24 = $.sibling(node_79, 2);
										var node_80 = $.child(div_24);

										{
											var consequent_19 = ($$anchor) => {
												var fragment_47 = root_20();
												var img_3 = $.first_child(fragment_47);
												var node_81 = $.sibling(img_3, 2);

												Button(node_81, {
													variant: 'ghost',
													size: 'sm',
													onclick: () => ($.get(item).iconURL = ""),
													children: ($$anchor, $$slotProps) => {
														XIcon($$anchor, { class: 'h-4 w-4' });
													},
													$$slots: { default: true }
												});

												$.template_effect(($0) => $.set_attribute(img_3, 'src', $0), [() => clientResolver(resolve, $.get(item).iconURL)]);
												$.append($$anchor, fragment_47);
											};

											var alternate_12 = ($$anchor) => {
												Button($$anchor, {
													variant: 'outline',
													size: 'sm',
													get disabled() {
														return $.get(item).uploading;
													},
													onclick: () => document.getElementById(`nav-icon-input-${index}`)?.click(),
													children: ($$anchor, $$slotProps) => {
														var fragment_50 = $.comment();
														var node_82 = $.first_child(fragment_50);

														{
															var consequent_20 = ($$anchor) => {
																Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
															};

															var alternate_11 = ($$anchor) => {
																UploadIcon($$anchor, { class: 'h-4 w-4' });
															};

															$.if(node_82, ($$render) => {
																if ($.get(item).uploading) $$render(consequent_20); else $$render(alternate_11, -1);
															});
														}

														$.append($$anchor, fragment_50);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_80, ($$render) => {
												if ($.get(item).iconURL) $$render(consequent_19); else $$render(alternate_12, -1);
											});
										}

										var input_4 = $.sibling(node_80, 2);

										$.set_attribute(input_4, 'id', `nav-icon-input-${index}`);
										$.reset(div_24);
										$.reset(div_23);
										$.reset(div_20);

										var node_83 = $.sibling(div_20, 2);

										Button(node_83, {
											variant: 'ghost',
											size: 'icon',
											onclick: () => removeNavItem(index),
											children: ($$anchor, $$slotProps) => {
												XIcon($$anchor, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});

										$.reset(div_19);
										$.delegated('change', input_4, (e) => handleNavIconUpload(e, index));
										$.append($$anchor, div_19);
									});

									var node_84 = $.sibling(node_74, 2);

									Button(node_84, {
										variant: 'outline',
										onclick: addNavItem,
										children: ($$anchor, $$slotProps) => {
											var fragment_54 = root_22();
											var node_85 = $.first_child(fragment_54);

											Plus(node_85, { class: 'h-4 w-4' });
											$.next();
											$.append($$anchor, fragment_54);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_46);
								},
								$$slots: { default: true }
							});
						});

						var node_86 = $.sibling(node_73, 2);

						$.component(node_86, () => Card.Footer, ($$anchor, Card_Footer_4) => {
							Card_Footer_4($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveNavigation,
										get disabled() {
											return $.get(savingNav);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_56 = $.comment();
											var node_87 = $.first_child(fragment_56);

											{
												var consequent_21 = ($$anchor) => {
													var fragment_57 = root_5();
													var node_88 = $.first_child(fragment_57);

													Loader(node_88, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_57);
												};

												var alternate_13 = ($$anchor) => {
													var fragment_58 = root_6();
													var node_89 = $.first_child(fragment_58);

													SaveIcon(node_89, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_58);
												};

												$.if(node_87, ($$render) => {
													if ($.get(savingNav)) $$render(consequent_21); else $$render(alternate_13, -1);
												});
											}

											$.append($$anchor, fragment_56);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_44);
					},
					$$slots: { default: true }
				});
			});

			var node_90 = $.sibling(node_69, 2);

			$.component(node_90, () => Card.Root, ($$anchor, Card_Root_5) => {
				Card_Root_5($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_59 = root_7();
						var node_91 = $.first_child(fragment_59);

						$.component(node_91, () => Card.Header, ($$anchor, Card_Header_5) => {
							Card_Header_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_60 = root_1();
									var node_92 = $.first_child(fragment_60);

									$.component(node_92, () => Card.Title, ($$anchor, Card_Title_5) => {
										Card_Title_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_22 = $.text('Monitor Sub Menu Options');

												$.append($$anchor, text_22);
											},
											$$slots: { default: true }
										});
									});

									var node_93 = $.sibling(node_92, 2);

									$.component(node_93, () => Card.Description, ($$anchor, Card_Description_5) => {
										Card_Description_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_23 = $.text('Configure which options appear in the monitor sub menu on the status page');

												$.append($$anchor, text_23);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_60);
								},
								$$slots: { default: true }
							});
						});

						var node_94 = $.sibling(node_91, 2);

						$.component(node_94, () => Card.Content, ($$anchor, Card_Content_5) => {
							Card_Content_5($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_61 = root_23();
									var div_25 = $.first_child(fragment_61);
									var div_26 = $.child(div_25);
									var node_95 = $.child(div_26);

									Label(node_95, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_24 = $.text('Share Badge');

											$.append($$anchor, text_24);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_26);

									var node_96 = $.sibling(div_26, 2);

									Switch(node_96, {
										get checked() {
											return $.get(subMenuOptions).showShareBadgeMonitor;
										},

										set checked($$value) {
											$.get(subMenuOptions).showShareBadgeMonitor = $$value;
										}
									});

									$.reset(div_25);

									var div_27 = $.sibling(div_25, 2);
									var div_28 = $.child(div_27);
									var node_97 = $.child(div_28);

									Label(node_97, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_25 = $.text('Share Embed');

											$.append($$anchor, text_25);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_28);

									var node_98 = $.sibling(div_28, 2);

									Switch(node_98, {
										get checked() {
											return $.get(subMenuOptions).showShareEmbedMonitor;
										},

										set checked($$value) {
											$.get(subMenuOptions).showShareEmbedMonitor = $$value;
										}
									});

									$.reset(div_27);

									var div_29 = $.sibling(div_27, 2);
									var div_30 = $.child(div_29);
									var node_99 = $.child(div_30);

									Label(node_99, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_26 = $.text('RSS Feed');

											$.append($$anchor, text_26);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_30);

									var node_100 = $.sibling(div_30, 2);

									Switch(node_100, {
										get checked() {
											return $.get(subMenuOptions).showRssFeed;
										},

										set checked($$value) {
											$.get(subMenuOptions).showRssFeed = $$value;
										}
									});

									$.reset(div_29);
									$.append($$anchor, fragment_61);
								},
								$$slots: { default: true }
							});
						});

						var node_101 = $.sibling(node_94, 2);

						$.component(node_101, () => Card.Footer, ($$anchor, Card_Footer_5) => {
							Card_Footer_5($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveSubMenuOptions,
										get disabled() {
											return $.get(savingSubMenuOptions);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_63 = $.comment();
											var node_102 = $.first_child(fragment_63);

											{
												var consequent_22 = ($$anchor) => {
													var fragment_64 = root_5();
													var node_103 = $.first_child(fragment_64);

													Loader(node_103, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_64);
												};

												var alternate_14 = ($$anchor) => {
													var fragment_65 = root_6();
													var node_104 = $.first_child(fragment_65);

													SaveIcon(node_104, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_65);
												};

												$.if(node_102, ($$render) => {
													if ($.get(savingSubMenuOptions)) $$render(consequent_22); else $$render(alternate_14, -1);
												});
											}

											$.append($$anchor, fragment_63);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_59);
					},
					$$slots: { default: true }
				});
			});

			var node_105 = $.sibling(node_90, 2);

			$.component(node_105, () => Card.Root, ($$anchor, Card_Root_6) => {
				Card_Root_6($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_66 = root_7();
						var node_106 = $.first_child(fragment_66);

						$.component(node_106, () => Card.Header, ($$anchor, Card_Header_6) => {
							Card_Header_6($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_67 = root_1();
									var node_107 = $.first_child(fragment_67);

									$.component(node_107, () => Card.Title, ($$anchor, Card_Title_6) => {
										Card_Title_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_27 = $.text('Global Page Visibility Settings');

												$.append($$anchor, text_27);
											},
											$$slots: { default: true }
										});
									});

									var node_108 = $.sibling(node_107, 2);

									$.component(node_108, () => Card.Description, ($$anchor, Card_Description_6) => {
										Card_Description_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_28 = $.text('Configure page switcher visibility and global exclusivity behavior for page-linked content.');

												$.append($$anchor, text_28);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_67);
								},
								$$slots: { default: true }
							});
						});

						var node_109 = $.sibling(node_106, 2);

						$.component(node_109, () => Card.Content, ($$anchor, Card_Content_6) => {
							Card_Content_6($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_68 = root_24();
									var div_31 = $.first_child(fragment_68);
									var div_32 = $.child(div_31);
									var node_110 = $.child(div_32);

									Label(node_110, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_29 = $.text('Show page switcher');

											$.append($$anchor, text_29);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_32);

									var node_111 = $.sibling(div_32, 2);

									Switch(node_111, {
										get disabled() {
											return $.get(globalPageVisibilitySettings).forceExclusivity;
										},

										get checked() {
											return $.get(globalPageVisibilitySettings).showSwitcher;
										},

										set checked($$value) {
											$.get(globalPageVisibilitySettings).showSwitcher = $$value;
										}
									});

									$.reset(div_31);

									var div_33 = $.sibling(div_31, 2);
									var div_34 = $.child(div_33);
									var node_112 = $.child(div_34);

									Label(node_112, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_30 = $.text('Force exclusivity');

											$.append($$anchor, text_30);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_34);

									var node_113 = $.sibling(div_34, 2);

									Switch(node_113, {
										get checked() {
											return $.get(globalPageVisibilitySettings).forceExclusivity;
										},
										onCheckedChange: onForceExclusivityChange
									});

									$.reset(div_33);
									$.append($$anchor, fragment_68);
								},
								$$slots: { default: true }
							});
						});

						var node_114 = $.sibling(node_109, 2);

						$.component(node_114, () => Card.Footer, ($$anchor, Card_Footer_6) => {
							Card_Footer_6($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveGlobalPageVisibilitySettings,
										get disabled() {
											return $.get(savingGlobalPageVisibilitySettings);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_70 = $.comment();
											var node_115 = $.first_child(fragment_70);

											{
												var consequent_23 = ($$anchor) => {
													var fragment_71 = root_5();
													var node_116 = $.first_child(fragment_71);

													Loader(node_116, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_71);
												};

												var alternate_15 = ($$anchor) => {
													var fragment_72 = root_6();
													var node_117 = $.first_child(fragment_72);

													SaveIcon(node_117, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_72);
												};

												$.if(node_115, ($$render) => {
													if ($.get(savingGlobalPageVisibilitySettings)) $$render(consequent_23); else $$render(alternate_15, -1);
												});
											}

											$.append($$anchor, fragment_70);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_66);
					},
					$$slots: { default: true }
				});
			});

			var node_118 = $.sibling(node_105, 2);

			$.component(node_118, () => Card.Root, ($$anchor, Card_Root_7) => {
				Card_Root_7($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_73 = root_7();
						var node_119 = $.first_child(fragment_73);

						$.component(node_119, () => Card.Header, ($$anchor, Card_Header_7) => {
							Card_Header_7($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_74 = root_1();
									var node_120 = $.first_child(fragment_74);

									$.component(node_120, () => Card.Title, ($$anchor, Card_Title_7) => {
										Card_Title_7($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_31 = $.text('Data Retention Policy');

												$.append($$anchor, text_31);
											},
											$$slots: { default: true }
										});
									});

									var node_121 = $.sibling(node_120, 2);

									$.component(node_121, () => Card.Description, ($$anchor, Card_Description_7) => {
										Card_Description_7($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_32 = $.text('Configure automatic cleanup for old monitor status data');

												$.append($$anchor, text_32);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_74);
								},
								$$slots: { default: true }
							});
						});

						var node_122 = $.sibling(node_119, 2);

						$.component(node_122, () => Card.Content, ($$anchor, Card_Content_7) => {
							Card_Content_7($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_75 = root_25();
									var div_35 = $.first_child(fragment_75);
									var div_36 = $.child(div_35);
									var node_123 = $.child(div_36);

									Label(node_123, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_33 = $.text('Enable Data Retention');

											$.append($$anchor, text_33);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_36);

									var node_124 = $.sibling(div_36, 2);

									Switch(node_124, {
										get checked() {
											return $.get(dataRetentionPolicy).enabled;
										},

										set checked($$value) {
											$.get(dataRetentionPolicy).enabled = $$value;
										}
									});

									$.reset(div_35);

									var div_37 = $.sibling(div_35, 2);
									var node_125 = $.child(div_37);

									Label(node_125, {
										for: 'retention-days',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_34 = $.text('Retention Days');

											$.append($$anchor, text_34);
										},
										$$slots: { default: true }
									});

									var node_126 = $.sibling(node_125, 2);

									{
										let $0 = $.derived(() => !$.get(dataRetentionPolicy).enabled);

										Input(node_126, {
											id: 'retention-days',
											type: 'number',
											min: '1',
											get disabled() {
												return $.get($0);
											},

											get value() {
												return $.get(dataRetentionPolicy).retentionDays;
											},

											set value($$value) {
												$.get(dataRetentionPolicy).retentionDays = $$value;
											}
										});
									}

									$.next(2);
									$.reset(div_37);
									$.append($$anchor, fragment_75);
								},
								$$slots: { default: true }
							});
						});

						var node_127 = $.sibling(node_122, 2);

						$.component(node_127, () => Card.Footer, ($$anchor, Card_Footer_7) => {
							Card_Footer_7($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveDataRetentionPolicy,
										get disabled() {
											return $.get(savingDataRetentionPolicy);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_77 = $.comment();
											var node_128 = $.first_child(fragment_77);

											{
												var consequent_24 = ($$anchor) => {
													var fragment_78 = root_5();
													var node_129 = $.first_child(fragment_78);

													Loader(node_129, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_78);
												};

												var alternate_16 = ($$anchor) => {
													var fragment_79 = root_6();
													var node_130 = $.first_child(fragment_79);

													SaveIcon(node_130, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_79);
												};

												$.if(node_128, ($$render) => {
													if ($.get(savingDataRetentionPolicy)) $$render(consequent_24); else $$render(alternate_16, -1);
												});
											}

											$.append($$anchor, fragment_77);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_73);
					},
					$$slots: { default: true }
				});
			});

			var node_131 = $.sibling(node_118, 2);

			$.component(node_131, () => Card.Root, ($$anchor, Card_Root_8) => {
				Card_Root_8($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_80 = root_7();
						var node_132 = $.first_child(fragment_80);

						$.component(node_132, () => Card.Header, ($$anchor, Card_Header_8) => {
							Card_Header_8($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_81 = root_1();
									var node_133 = $.first_child(fragment_81);

									$.component(node_133, () => Card.Title, ($$anchor, Card_Title_8) => {
										Card_Title_8($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_35 = $.text('Event Display Settings');

												$.append($$anchor, text_35);
											},
											$$slots: { default: true }
										});
									});

									var node_134 = $.sibling(node_133, 2);

									$.component(node_134, () => Card.Description, ($$anchor, Card_Description_8) => {
										Card_Description_8($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_36 = $.text('Configure which incidents and maintenances are shown on the site');

												$.append($$anchor, text_36);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_81);
								},
								$$slots: { default: true }
							});
						});

						var node_135 = $.sibling(node_132, 2);

						$.component(node_135, () => Card.Content, ($$anchor, Card_Content_8) => {
							Card_Content_8($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_82 = root_29();
									var div_38 = $.first_child(fragment_82);
									var div_39 = $.child(div_38);
									var node_136 = $.child(div_39);

									Label(node_136, {
										for: 'events-display-inline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_37 = $.text('Display Events Inline');

											$.append($$anchor, text_37);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_39);

									var node_137 = $.sibling(div_39, 2);

									Switch(node_137, {
										id: 'events-display-inline',
										get checked() {
											return $.get(eventDisplaySettings).showInlineEvents;
										},

										set checked($$value) {
											$.get(eventDisplaySettings).showInlineEvents = $$value;
										}
									});

									$.reset(div_38);

									var div_40 = $.sibling(div_38, 2);
									var div_41 = $.child(div_40);
									var div_42 = $.child(div_41);
									var node_138 = $.child(div_42);

									Label(node_138, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_38 = $.text('Incidents');

											$.append($$anchor, text_38);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_42);

									var node_139 = $.sibling(div_42, 2);

									Switch(node_139, {
										get checked() {
											return $.get(eventDisplaySettings).incidents.enabled;
										},

										set checked($$value) {
											$.get(eventDisplaySettings).incidents.enabled = $$value;
										}
									});

									$.reset(div_41);

									var node_140 = $.sibling(div_41, 2);

									{
										var consequent_26 = ($$anchor) => {
											var div_43 = root_27();
											var div_44 = $.child(div_43);
											var div_45 = $.child(div_44);
											var node_141 = $.child(div_45);

											Label(node_141, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_39 = $.text('Show Ongoing Incidents');

													$.append($$anchor, text_39);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_45);

											var node_142 = $.sibling(div_45, 2);

											Switch(node_142, {
												get checked() {
													return $.get(eventDisplaySettings).incidents.ongoing.show;
												},

												set checked($$value) {
													$.get(eventDisplaySettings).incidents.ongoing.show = $$value;
												}
											});

											$.reset(div_44);

											var div_46 = $.sibling(div_44, 2);
											var div_47 = $.child(div_46);
											var node_143 = $.child(div_47);

											Label(node_143, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_40 = $.text('Show Resolved Incidents');

													$.append($$anchor, text_40);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_47);

											var node_144 = $.sibling(div_47, 2);

											Switch(node_144, {
												get checked() {
													return $.get(eventDisplaySettings).incidents.resolved.show;
												},

												set checked($$value) {
													$.get(eventDisplaySettings).incidents.resolved.show = $$value;
												}
											});

											$.reset(div_46);

											var node_145 = $.sibling(div_46, 2);

											{
												var consequent_25 = ($$anchor) => {
													var div_48 = root_26();
													var div_49 = $.child(div_48);
													var node_146 = $.child(div_49);

													Label(node_146, {
														for: 'events-incidents-max-count',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_41 = $.text('Max Resolved Count');

															$.append($$anchor, text_41);
														},
														$$slots: { default: true }
													});

													var node_147 = $.sibling(node_146, 2);

													Input(node_147, {
														id: 'events-incidents-max-count',
														type: 'number',
														min: '1',
														max: '50',
														get value() {
															return $.get(eventDisplaySettings).incidents.resolved.maxCount;
														},

														set value($$value) {
															$.get(eventDisplaySettings).incidents.resolved.maxCount = $$value;
														}
													});

													$.reset(div_49);

													var div_50 = $.sibling(div_49, 2);
													var node_148 = $.child(div_50);

													Label(node_148, {
														for: 'events-incidents-days-in-past',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_42 = $.text('Days in Past');

															$.append($$anchor, text_42);
														},
														$$slots: { default: true }
													});

													var node_149 = $.sibling(node_148, 2);

													Input(node_149, {
														id: 'events-incidents-days-in-past',
														type: 'number',
														min: '1',
														max: '90',
														get value() {
															return $.get(eventDisplaySettings).incidents.resolved.daysInPast;
														},

														set value($$value) {
															$.get(eventDisplaySettings).incidents.resolved.daysInPast = $$value;
														}
													});

													$.reset(div_50);
													$.reset(div_48);
													$.append($$anchor, div_48);
												};

												$.if(node_145, ($$render) => {
													if ($.get(eventDisplaySettings).incidents.resolved.show) $$render(consequent_25);
												});
											}

											$.reset(div_43);
											$.append($$anchor, div_43);
										};

										$.if(node_140, ($$render) => {
											if ($.get(eventDisplaySettings).incidents.enabled) $$render(consequent_26);
										});
									}

									$.reset(div_40);

									var div_51 = $.sibling(div_40, 4);
									var div_52 = $.child(div_51);
									var div_53 = $.child(div_52);
									var node_150 = $.child(div_53);

									Label(node_150, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_43 = $.text('Maintenances');

											$.append($$anchor, text_43);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_53);

									var node_151 = $.sibling(div_53, 2);

									Switch(node_151, {
										get checked() {
											return $.get(eventDisplaySettings).maintenances.enabled;
										},

										set checked($$value) {
											$.get(eventDisplaySettings).maintenances.enabled = $$value;
										}
									});

									$.reset(div_52);

									var node_152 = $.sibling(div_52, 2);

									{
										var consequent_29 = ($$anchor) => {
											var div_54 = root_28();
											var div_55 = $.child(div_54);
											var div_56 = $.child(div_55);
											var node_153 = $.child(div_56);

											Label(node_153, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_44 = $.text('Show Ongoing Maintenances');

													$.append($$anchor, text_44);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_56);

											var node_154 = $.sibling(div_56, 2);

											Switch(node_154, {
												get checked() {
													return $.get(eventDisplaySettings).maintenances.ongoing.show;
												},

												set checked($$value) {
													$.get(eventDisplaySettings).maintenances.ongoing.show = $$value;
												}
											});

											$.reset(div_55);

											var div_57 = $.sibling(div_55, 2);
											var div_58 = $.child(div_57);
											var node_155 = $.child(div_58);

											Label(node_155, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_45 = $.text('Show Past Maintenances');

													$.append($$anchor, text_45);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_58);

											var node_156 = $.sibling(div_58, 2);

											Switch(node_156, {
												get checked() {
													return $.get(eventDisplaySettings).maintenances.past.show;
												},

												set checked($$value) {
													$.get(eventDisplaySettings).maintenances.past.show = $$value;
												}
											});

											$.reset(div_57);

											var node_157 = $.sibling(div_57, 2);

											{
												var consequent_27 = ($$anchor) => {
													var div_59 = root_26();
													var div_60 = $.child(div_59);
													var node_158 = $.child(div_60);

													Label(node_158, {
														for: 'events-maint-past-max-count',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_46 = $.text('Max Past Count');

															$.append($$anchor, text_46);
														},
														$$slots: { default: true }
													});

													var node_159 = $.sibling(node_158, 2);

													Input(node_159, {
														id: 'events-maint-past-max-count',
														type: 'number',
														min: '1',
														max: '50',
														get value() {
															return $.get(eventDisplaySettings).maintenances.past.maxCount;
														},

														set value($$value) {
															$.get(eventDisplaySettings).maintenances.past.maxCount = $$value;
														}
													});

													$.reset(div_60);

													var div_61 = $.sibling(div_60, 2);
													var node_160 = $.child(div_61);

													Label(node_160, {
														for: 'events-maint-past-days-in-past',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_47 = $.text('Days in Past');

															$.append($$anchor, text_47);
														},
														$$slots: { default: true }
													});

													var node_161 = $.sibling(node_160, 2);

													Input(node_161, {
														id: 'events-maint-past-days-in-past',
														type: 'number',
														min: '1',
														max: '90',
														get value() {
															return $.get(eventDisplaySettings).maintenances.past.daysInPast;
														},

														set value($$value) {
															$.get(eventDisplaySettings).maintenances.past.daysInPast = $$value;
														}
													});

													$.reset(div_61);
													$.reset(div_59);
													$.append($$anchor, div_59);
												};

												$.if(node_157, ($$render) => {
													if ($.get(eventDisplaySettings).maintenances.past.show) $$render(consequent_27);
												});
											}

											var div_62 = $.sibling(node_157, 2);
											var div_63 = $.child(div_62);
											var node_162 = $.child(div_63);

											Label(node_162, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_48 = $.text('Show Upcoming Maintenances');

													$.append($$anchor, text_48);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_63);

											var node_163 = $.sibling(div_63, 2);

											Switch(node_163, {
												get checked() {
													return $.get(eventDisplaySettings).maintenances.upcoming.show;
												},

												set checked($$value) {
													$.get(eventDisplaySettings).maintenances.upcoming.show = $$value;
												}
											});

											$.reset(div_62);

											var node_164 = $.sibling(div_62, 2);

											{
												var consequent_28 = ($$anchor) => {
													var div_64 = root_26();
													var div_65 = $.child(div_64);
													var node_165 = $.child(div_65);

													Label(node_165, {
														for: 'events-maint-upcoming-max-count',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_49 = $.text('Max Upcoming Count');

															$.append($$anchor, text_49);
														},
														$$slots: { default: true }
													});

													var node_166 = $.sibling(node_165, 2);

													Input(node_166, {
														id: 'events-maint-upcoming-max-count',
														type: 'number',
														min: '1',
														max: '50',
														get value() {
															return $.get(eventDisplaySettings).maintenances.upcoming.maxCount;
														},

														set value($$value) {
															$.get(eventDisplaySettings).maintenances.upcoming.maxCount = $$value;
														}
													});

													$.reset(div_65);

													var div_66 = $.sibling(div_65, 2);
													var node_167 = $.child(div_66);

													Label(node_167, {
														for: 'events-maint-upcoming-days-in-future',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_50 = $.text('Days in Future');

															$.append($$anchor, text_50);
														},
														$$slots: { default: true }
													});

													var node_168 = $.sibling(node_167, 2);

													Input(node_168, {
														id: 'events-maint-upcoming-days-in-future',
														type: 'number',
														min: '1',
														max: '90',
														get value() {
															return $.get(eventDisplaySettings).maintenances.upcoming.daysInFuture;
														},

														set value($$value) {
															$.get(eventDisplaySettings).maintenances.upcoming.daysInFuture = $$value;
														}
													});

													$.reset(div_66);
													$.reset(div_64);
													$.append($$anchor, div_64);
												};

												$.if(node_164, ($$render) => {
													if ($.get(eventDisplaySettings).maintenances.upcoming.show) $$render(consequent_28);
												});
											}

											$.reset(div_54);
											$.append($$anchor, div_54);
										};

										$.if(node_152, ($$render) => {
											if ($.get(eventDisplaySettings).maintenances.enabled) $$render(consequent_29);
										});
									}

									$.reset(div_51);
									$.append($$anchor, fragment_82);
								},
								$$slots: { default: true }
							});
						});

						var node_169 = $.sibling(node_135, 2);

						$.component(node_169, () => Card.Footer, ($$anchor, Card_Footer_8) => {
							Card_Footer_8($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveEventDisplaySettings,
										get disabled() {
											return $.get(savingEventDisplaySettings);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_84 = $.comment();
											var node_170 = $.first_child(fragment_84);

											{
												var consequent_30 = ($$anchor) => {
													var fragment_85 = root_5();
													var node_171 = $.first_child(fragment_85);

													Loader(node_171, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_85);
												};

												var alternate_17 = ($$anchor) => {
													var fragment_86 = root_6();
													var node_172 = $.first_child(fragment_86);

													SaveIcon(node_172, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_86);
												};

												$.if(node_170, ($$render) => {
													if ($.get(savingEventDisplaySettings)) $$render(consequent_30); else $$render(alternate_17, -1);
												});
											}

											$.append($$anchor, fragment_84);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_80);
					},
					$$slots: { default: true }
				});
			});

			var node_173 = $.sibling(node_131, 2);

			$.component(node_173, () => Card.Root, ($$anchor, Card_Root_9) => {
				Card_Root_9($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_87 = root_7();
						var node_174 = $.first_child(fragment_87);

						$.component(node_174, () => Card.Header, ($$anchor, Card_Header_9) => {
							Card_Header_9($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_88 = root_1();
									var node_175 = $.first_child(fragment_88);

									$.component(node_175, () => Card.Title, ($$anchor, Card_Title_9) => {
										Card_Title_9($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_51 = $.text('Sitemap');

												$.append($$anchor, text_51);
											},
											$$slots: { default: true }
										});
									});

									var node_176 = $.sibling(node_175, 2);

									$.component(node_176, () => Card.Description, ($$anchor, Card_Description_9) => {
										Card_Description_9($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_52 = $.text('Configure how your sitemap.xml is generated');

												$.append($$anchor, text_52);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_88);
								},
								$$slots: { default: true }
							});
						});

						var node_177 = $.sibling(node_174, 2);

						$.component(node_177, () => Card.Content, ($$anchor, Card_Content_9) => {
							Card_Content_9($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_89 = root_35();
									var div_67 = $.first_child(fragment_89);
									var node_178 = $.child(div_67);

									Label(node_178, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_53 = $.text('Mode');

											$.append($$anchor, text_53);
										},
										$$slots: { default: true }
									});

									var node_179 = $.sibling(node_178, 2);

									$.component(node_179, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
										RadioGroup_Root($$anchor, {
											get value() {
												return $.get(sitemap).mode;
											},

											onValueChange: (v) => {
												$.get(sitemap).mode = v;

												if (v === "manual" && $.get(sitemap).urls.length === 0) {
													$.get(sitemap).urls = [{ loc: "" }];
												}
											},
											class: 'flex flex-col gap-3',
											children: ($$anchor, $$slotProps) => {
												var fragment_90 = root_30();
												var div_68 = $.first_child(fragment_90);
												var node_180 = $.child(div_68);

												$.component(node_180, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
													RadioGroup_Item($$anchor, { value: 'auto', id: 'sitemap-auto' });
												});

												var node_181 = $.sibling(node_180, 2);

												Label(node_181, {
													for: 'sitemap-auto',
													class: 'cursor-pointer font-normal',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_54 = $.text('Auto');

														$.append($$anchor, text_54);
													},
													$$slots: { default: true }
												});

												$.reset(div_68);

												var div_69 = $.sibling(div_68, 2);
												var node_182 = $.child(div_69);

												$.component(node_182, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
													RadioGroup_Item_1($$anchor, { value: 'manual', id: 'sitemap-manual' });
												});

												var node_183 = $.sibling(node_182, 2);

												Label(node_183, {
													for: 'sitemap-manual',
													class: 'cursor-pointer font-normal',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_55 = $.text('Manual');

														$.append($$anchor, text_55);
													},
													$$slots: { default: true }
												});

												$.reset(div_69);

												var div_70 = $.sibling(div_69, 2);
												var node_184 = $.child(div_70);

												$.component(node_184, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
													RadioGroup_Item_2($$anchor, { value: 'off', id: 'sitemap-off' });
												});

												var node_185 = $.sibling(node_184, 2);

												Label(node_185, {
													for: 'sitemap-off',
													class: 'cursor-pointer font-normal',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_56 = $.text('Off');

														$.append($$anchor, text_56);
													},
													$$slots: { default: true }
												});

												$.reset(div_70);
												$.append($$anchor, fragment_90);
											},
											$$slots: { default: true }
										});
									});

									var p_7 = $.sibling(node_179, 2);
									var node_186 = $.child(p_7);

									{
										var consequent_31 = ($$anchor) => {
											var text_57 = $.text('Sitemap will be auto-generated from your monitors and pages. You can also add additional URLs below.');

											$.append($$anchor, text_57);
										};

										var consequent_32 = ($$anchor) => {
											var text_58 = $.text('Provide custom URLs to include in the sitemap.');

											$.append($$anchor, text_58);
										};

										var alternate_18 = ($$anchor) => {
											var text_59 = $.text('Sitemap generation is disabled.');

											$.append($$anchor, text_59);
										};

										$.if(node_186, ($$render) => {
											if ($.get(sitemap).mode === "auto") $$render(consequent_31); else if ($.get(sitemap).mode === "manual") $$render(consequent_32, 1); else $$render(alternate_18, -1);
										});
									}

									$.reset(p_7);
									$.reset(div_67);

									var node_187 = $.sibling(div_67, 2);

									{
										var consequent_34 = ($$anchor) => {
											var div_71 = root_34();
											var node_188 = $.child(div_71);

											Label(node_188, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_60 = $.text();

													$.template_effect(() => $.set_text(text_60, $.get(sitemap).mode === "auto" ? "Additional URLs" : "URLs"));
													$.append($$anchor, text_60);
												},
												$$slots: { default: true }
											});

											var node_189 = $.sibling(node_188, 2);

											$.each(node_189, 17, () => $.get(sitemap).urls, $.index, ($$anchor, url, index) => {
												var div_72 = root_31();
												var node_190 = $.child(div_72);

												Input(node_190, {
													type: 'url',
													placeholder: 'https://example.com/page',
													class: 'flex-1',
													get value() {
														return $.get(url).loc;
													},

													set value($$value) {
														($.get(url).loc = $$value);
													}
												});

												var node_191 = $.sibling(node_190, 2);

												{
													let $0 = $.derived(() => $.get(sitemap).mode === "manual" && $.get(sitemap).urls.length <= 1);

													Button(node_191, {
														variant: 'ghost',
														size: 'icon',
														onclick: () => removeSitemapUrl(index),
														get disabled() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															XIcon($$anchor, { class: 'h-4 w-4' });
														},
														$$slots: { default: true }
													});
												}

												$.reset(div_72);
												$.append($$anchor, div_72);
											});

											var node_192 = $.sibling(node_189, 2);

											Button(node_192, {
												variant: 'outline',
												onclick: addSitemapUrl,
												children: ($$anchor, $$slotProps) => {
													var fragment_93 = root_32();
													var node_193 = $.first_child(fragment_93);

													Plus(node_193, { class: 'h-4 w-4' });

													var text_61 = $.sibling(node_193);

													$.template_effect(() => $.set_text(text_61, ` ${$.get(sitemap).urls.length > 0 ? "Add More URLs" : "Add URL"}`));
													$.append($$anchor, fragment_93);
												},
												$$slots: { default: true }
											});

											var node_194 = $.sibling(node_192, 2);

											{
												var consequent_33 = ($$anchor) => {
													var p_8 = root_33();

													$.append($$anchor, p_8);
												};

												$.if(node_194, ($$render) => {
													if ($.get(sitemap).mode === "manual" && $.get(sitemap).urls.length === 0) $$render(consequent_33);
												});
											}

											$.reset(div_71);
											$.append($$anchor, div_71);
										};

										$.if(node_187, ($$render) => {
											if ($.get(sitemap).mode === "manual" || $.get(sitemap).mode === "auto") $$render(consequent_34);
										});
									}

									$.append($$anchor, fragment_89);
								},
								$$slots: { default: true }
							});
						});

						var node_195 = $.sibling(node_177, 2);

						$.component(node_195, () => Card.Footer, ($$anchor, Card_Footer_9) => {
							Card_Footer_9($$anchor, {
								class: 'flex justify-end gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_94 = root_1();
									var node_196 = $.first_child(fragment_94);

									{
										var consequent_35 = ($$anchor) => {
											var fragment_95 = root_1();
											var node_197 = $.first_child(fragment_95);

											CopyButton(node_197, {
												variant: 'outline',
												size: 'default',
												get text() {
													return $.get(sitemapURL);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_96 = root_36();
													var node_198 = $.first_child(fragment_96);

													CopyIcon(node_198, { class: 'mr-2 h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_96);
												},
												$$slots: { default: true }
											});

											var node_199 = $.sibling(node_197, 2);

											Button(node_199, {
												variant: 'outline',
												class: 'cursor-pointer',
												onclick: () => window.open(clientResolver(resolve, "/sitemap.xml"), "_blank"),
												children: ($$anchor, $$slotProps) => {
													var fragment_97 = root_37();
													var node_200 = $.first_child(fragment_97);

													ExternalLinkIcon(node_200, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_97);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_95);
										};

										$.if(node_196, ($$render) => {
											if ($.get(sitemap).mode !== "off" && $.get(sitemapURL)) $$render(consequent_35);
										});
									}

									var node_201 = $.sibling(node_196, 2);

									{
										let $0 = $.derived(() => $.get(savingSitemap) || !$.get(isValidSitemap));

										Button(node_201, {
											onclick: saveSitemap,
											get disabled() {
												return $.get($0);
											},
											class: 'cursor-pointer',
											children: ($$anchor, $$slotProps) => {
												var fragment_98 = $.comment();
												var node_202 = $.first_child(fragment_98);

												{
													var consequent_36 = ($$anchor) => {
														var fragment_99 = root_5();
														var node_203 = $.first_child(fragment_99);

														Loader(node_203, { class: 'h-4 w-4 animate-spin' });
														$.next();
														$.append($$anchor, fragment_99);
													};

													var alternate_19 = ($$anchor) => {
														var fragment_100 = root_6();
														var node_204 = $.first_child(fragment_100);

														SaveIcon(node_204, { class: 'h-4 w-4' });
														$.next();
														$.append($$anchor, fragment_100);
													};

													$.if(node_202, ($$render) => {
														if ($.get(savingSitemap)) $$render(consequent_36); else $$render(alternate_19, -1);
													});
												}

												$.append($$anchor, fragment_98);
											},
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_94);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_87);
					},
					$$slots: { default: true }
				});
			});

			var node_205 = $.sibling(node_173, 2);

			$.component(node_205, () => Card.Root, ($$anchor, Card_Root_10) => {
				Card_Root_10($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_101 = root_7();
						var node_206 = $.first_child(fragment_101);

						$.component(node_206, () => Card.Header, ($$anchor, Card_Header_10) => {
							Card_Header_10($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_102 = root_1();
									var node_207 = $.first_child(fragment_102);

									$.component(node_207, () => Card.Title, ($$anchor, Card_Title_10) => {
										Card_Title_10($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_62 = $.text('Maintenance Notification Settings');

												$.append($$anchor, text_62);
											},
											$$slots: { default: true }
										});
									});

									var node_208 = $.sibling(node_207, 2);

									$.component(node_208, () => Card.Description, ($$anchor, Card_Description_10) => {
										Card_Description_10($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_63 = $.text('Configure which maintenance lifecycle events trigger subscriber notifications');

												$.append($$anchor, text_63);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_102);
								},
								$$slots: { default: true }
							});
						});

						var node_209 = $.sibling(node_206, 2);

						$.component(node_209, () => Card.Content, ($$anchor, Card_Content_10) => {
							Card_Content_10($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_103 = root_39();
									var div_73 = $.first_child(fragment_103);
									var node_210 = $.child(div_73);

									Label(node_210, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_64 = $.text('Event Types');

											$.append($$anchor, text_64);
										},
										$$slots: { default: true }
									});

									var div_74 = $.sibling(node_210, 2);
									var div_75 = $.child(div_74);
									var node_211 = $.sibling($.child(div_75), 2);

									Switch(node_211, {
										get checked() {
											return $.get(maintenanceNotificationSettings).event_types.created;
										},

										onCheckedChange: (v) => {
											$.get(maintenanceNotificationSettings).event_types.created = v === true;
										}
									});

									$.reset(div_75);

									var div_76 = $.sibling(div_75, 2);
									var node_212 = $.sibling($.child(div_76), 2);

									Switch(node_212, {
										get checked() {
											return $.get(maintenanceNotificationSettings).event_types.reminder;
										},

										onCheckedChange: (v) => {
											$.get(maintenanceNotificationSettings).event_types.reminder = v === true;
										}
									});

									$.reset(div_76);

									var div_77 = $.sibling(div_76, 2);
									var node_213 = $.sibling($.child(div_77), 2);

									Switch(node_213, {
										get checked() {
											return $.get(maintenanceNotificationSettings).event_types.started;
										},

										onCheckedChange: (v) => {
											$.get(maintenanceNotificationSettings).event_types.started = v === true;
										}
									});

									$.reset(div_77);

									var div_78 = $.sibling(div_77, 2);
									var node_214 = $.sibling($.child(div_78), 2);

									Switch(node_214, {
										get checked() {
											return $.get(maintenanceNotificationSettings).event_types.ended;
										},

										onCheckedChange: (v) => {
											$.get(maintenanceNotificationSettings).event_types.ended = v === true;
										}
									});

									$.reset(div_78);
									$.reset(div_74);
									$.reset(div_73);

									var node_215 = $.sibling(div_73, 2);

									{
										var consequent_37 = ($$anchor) => {
											var div_79 = root_38();
											var node_216 = $.child(div_79);

											Label(node_216, {
												for: 'reminder-buffer-hours',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_65 = $.text('Reminder Buffer (hours)');

													$.append($$anchor, text_65);
												},
												$$slots: { default: true }
											});

											var node_217 = $.sibling(node_216, 2);

											Input(node_217, {
												id: 'reminder-buffer-hours',
												type: 'number',
												min: 1,
												get value() {
													return $.get(maintenanceNotificationSettings).reminder_buffer_hours;
												},

												set value($$value) {
													$.get(maintenanceNotificationSettings).reminder_buffer_hours = $$value;
												}
											});

											$.next(2);
											$.reset(div_79);
											$.append($$anchor, div_79);
										};

										$.if(node_215, ($$render) => {
											if ($.get(maintenanceNotificationSettings).event_types.reminder) $$render(consequent_37);
										});
									}

									$.append($$anchor, fragment_103);
								},
								$$slots: { default: true }
							});
						});

						var node_218 = $.sibling(node_209, 2);

						$.component(node_218, () => Card.Footer, ($$anchor, Card_Footer_10) => {
							Card_Footer_10($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: saveMaintenanceNotificationSettings,
										get disabled() {
											return $.get(savingMaintenanceNotificationSettings);
										},
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											var fragment_105 = $.comment();
											var node_219 = $.first_child(fragment_105);

											{
												var consequent_38 = ($$anchor) => {
													var fragment_106 = root_5();
													var node_220 = $.first_child(fragment_106);

													Loader(node_220, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_106);
												};

												var alternate_20 = ($$anchor) => {
													var fragment_107 = root_6();
													var node_221 = $.first_child(fragment_107);

													SaveIcon(node_221, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_107);
												};

												$.if(node_219, ($$render) => {
													if ($.get(savingMaintenanceNotificationSettings)) $$render(consequent_38); else $$render(alternate_20, -1);
												});
											}

											$.append($$anchor, fragment_105);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_101);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate_21, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);