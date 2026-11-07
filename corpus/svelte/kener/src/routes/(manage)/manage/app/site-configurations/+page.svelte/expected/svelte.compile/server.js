import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Form state
		let loading = true;

		let savingSiteInfo = false;
		let savingLogo = false;
		let savingFavicon = false;
		let savingSocialPreviewImage = false;
		let savingNav = false;
		let savingSubMenuOptions = false;
		let savingGlobalPageVisibilitySettings = false;
		let savingDataRetentionPolicy = false;
		let savingEventDisplaySettings = false;
		let savingSitemap = false;
		let savingMaintenanceNotificationSettings = false;
		let uploadingLogo = false;
		let uploadingFavicon = false;
		let uploadingSocialPreviewImage = false;
		const defaultEventDisplaySettings = page.data.seedSiteData.eventDisplaySettings;

		// Site data
		let siteData = {
			siteName: "",
			siteURL: "",
			logo: "",
			favicon: "",
			socialPreviewImage: null
		};

		// Navigation data
		let nav = [];

		// Sub Menu Options
		let subMenuOptions = {
			showShareBadgeMonitor: true,
			showShareEmbedMonitor: true,
			showRssFeed: true
		};

		const defaultGlobalPageVisibilitySettings = page.data.seedSiteData.globalPageVisibilitySettings;
		let globalPageVisibilitySettings = structuredClone(defaultGlobalPageVisibilitySettings);
		let dataRetentionPolicy = page.data.seedSiteData.dataRetentionPolicy;
		let eventDisplaySettings = structuredClone(defaultEventDisplaySettings);
		let metaSiteTitle = "";
		let metaSiteDescription = "";
		const defaultSitemap = page.data.seedSiteData.sitemap;
		let sitemap = structuredClone(defaultSitemap);
		const defaultMaintenanceNotificationSettings = page.data.seedSiteData.globalMaintenanceNotificationSettings;
		let maintenanceNotificationSettings = structuredClone(defaultMaintenanceNotificationSettings);

		const sitemapURL = $.derived(() => siteData.siteURL
			? siteData.siteURL.replace(/\/$/, "") + clientResolver(resolve, "/sitemap.xml")
			: "");

		let currentOrigin = "";

		function onForceExclusivityChange(checked) {
			const enabled = checked === true;

			globalPageVisibilitySettings.forceExclusivity = enabled;

			if (enabled) {
				globalPageVisibilitySettings.showSwitcher = true;
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

		const parsedSiteOriginURL = $.derived(() => parseOriginOnlyURL(siteData.siteURL));
		const isOriginOnlySiteURL = $.derived(() => parsedSiteOriginURL() !== null);
		const enteredSiteOrigin = $.derived(() => parsedSiteOriginURL()?.origin ?? "");
		const hasOriginMismatch = $.derived(() => Boolean(currentOrigin && enteredSiteOrigin() && currentOrigin !== enteredSiteOrigin()));

		// Validation
		const isValidSiteInfo = $.derived(() => siteData.siteName.trim().length > 0 && siteData.siteURL.trim().length > 0 && isOriginOnlySiteURL());

		async function fetchSiteData() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getAllSiteData" })
				});

				if (response.ok) {
					const data = await response.json();

					siteData = {
						siteName: data.siteName || "",
						siteURL: data.siteURL || "",
						logo: data.logo || "",
						favicon: data.favicon || "",
						socialPreviewImage: data.socialPreviewImage || null
					};

					if (data.nav) {
						nav = data.nav.map((item) => ({
							name: item.name || "",
							url: item.url || "",
							iconURL: item.iconURL || ""
						}));
					}

					if (data.subMenuOptions) {
						subMenuOptions = {
							showShareBadgeMonitor: data.subMenuOptions.showShareBadgeMonitor ?? true,
							showShareEmbedMonitor: data.subMenuOptions.showShareEmbedMonitor ?? true,
							showRssFeed: data.subMenuOptions.showRssFeed ?? true
						};
					}

					if (data.globalPageVisibilitySettings) {
						try {
							const parsed = typeof data.globalPageVisibilitySettings === "string"
								? JSON.parse(data.globalPageVisibilitySettings)
								: data.globalPageVisibilitySettings;

							globalPageVisibilitySettings = {
								...structuredClone(defaultGlobalPageVisibilitySettings),
								...parsed,
								showSwitcher: Boolean(parsed?.showSwitcher ?? true),
								forceExclusivity: Boolean(parsed?.forceExclusivity ?? false)
							};
						} catch {
							globalPageVisibilitySettings = structuredClone(defaultGlobalPageVisibilitySettings);
						}
					} else {
						globalPageVisibilitySettings = structuredClone(defaultGlobalPageVisibilitySettings);
					}

					dataRetentionPolicy = {
						enabled: data.dataRetentionPolicy?.enabled ?? true,
						retentionDays: data.dataRetentionPolicy?.retentionDays ?? 90
					};

					if (data.eventDisplaySettings) {
						try {
							eventDisplaySettings = parseEventDisplaySettings(data.eventDisplaySettings);
						} catch {
							eventDisplaySettings = structuredClone(defaultEventDisplaySettings);
						}
					} else {
						eventDisplaySettings = structuredClone(defaultEventDisplaySettings);
					}

					metaSiteTitle = data.metaSiteTitle || "";
					metaSiteDescription = data.metaSiteDescription || "";

					if (data.sitemap) {
						try {
							const parsed = typeof data.sitemap === "string" ? JSON.parse(data.sitemap) : data.sitemap;

							sitemap = {
								mode: parsed?.mode ?? "auto",
								urls: Array.isArray(parsed?.urls) ? parsed.urls : []
							};
						} catch {
							sitemap = structuredClone(defaultSitemap);
						}
					} else {
						sitemap = structuredClone(defaultSitemap);
					}

					if (data.globalMaintenanceNotificationSettings) {
						try {
							const parsed = typeof data.globalMaintenanceNotificationSettings === "string"
								? JSON.parse(data.globalMaintenanceNotificationSettings)
								: data.globalMaintenanceNotificationSettings;

							maintenanceNotificationSettings = {
								...structuredClone(defaultMaintenanceNotificationSettings),
								...parsed,
								event_types: {
									...structuredClone(defaultMaintenanceNotificationSettings.event_types),
									...parsed?.event_types
								}
							};
						} catch {
							maintenanceNotificationSettings = structuredClone(defaultMaintenanceNotificationSettings);
						}
					} else {
						maintenanceNotificationSettings = structuredClone(defaultMaintenanceNotificationSettings);
					}
				}
			} catch(e) {
				toast.error("Failed to load site data");
			} finally {
				loading = false;
			}
		}

		async function saveSiteInfo() {
			if (!isValidSiteInfo()) return;

			savingSiteInfo = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { siteName: siteData.siteName, siteURL: siteData.siteURL }
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
				savingSiteInfo = false;
			}
		}

		async function saveLogo() {
			savingLogo = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeSiteData", data: { logo: siteData.logo } })
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
				savingLogo = false;
			}
		}

		async function saveFavicon() {
			savingFavicon = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeSiteData", data: { favicon: siteData.favicon } })
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
				savingFavicon = false;
			}
		}

		async function saveSocialPreviewImage() {
			savingSocialPreviewImage = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: {
							socialPreviewImage: siteData.socialPreviewImage,
							metaSiteTitle,
							metaSiteDescription
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
				savingSocialPreviewImage = false;
			}
		}

		async function saveNavigation() {
			savingNav = true;

			try {
				const cleanNav = nav.map((item) => ({ name: item.name, url: item.url, iconURL: item.iconURL }));

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
				savingNav = false;
			}
		}

		async function saveSubMenuOptions() {
			savingSubMenuOptions = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { subMenuOptions: JSON.stringify(subMenuOptions) }
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
				savingSubMenuOptions = false;
			}
		}

		async function saveGlobalPageVisibilitySettings() {
			savingGlobalPageVisibilitySettings = true;

			try {
				const payload = {
					showSwitcher: globalPageVisibilitySettings.forceExclusivity ? true : globalPageVisibilitySettings.showSwitcher,
					forceExclusivity: globalPageVisibilitySettings.forceExclusivity
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
					globalPageVisibilitySettings = payload;
					toast.success("Global page visibility settings saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save global page visibility settings");
			} finally {
				savingGlobalPageVisibilitySettings = false;
			}
		}

		async function saveDataRetentionPolicy() {
			savingDataRetentionPolicy = true;

			try {
				const safeRetentionDays = Math.max(1, Number(dataRetentionPolicy.retentionDays) || 90);

				const payload = {
					enabled: dataRetentionPolicy.enabled,
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
					dataRetentionPolicy.retentionDays = safeRetentionDays;
					toast.success("Data retention policy saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save data retention policy");
			} finally {
				savingDataRetentionPolicy = false;
			}
		}

		async function saveEventDisplaySettings() {
			savingEventDisplaySettings = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { eventDisplaySettings: JSON.stringify(eventDisplaySettings) }
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
				savingEventDisplaySettings = false;
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
			sitemap.urls = [...sitemap.urls, { loc: "" }];
		}

		function removeSitemapUrl(index) {
			sitemap.urls = sitemap.urls.filter((_, i) => i !== index);
		}

		const isValidSitemap = $.derived(() => sitemap.mode !== "manual" || sitemap.urls.length > 0 && sitemap.urls.every((u) => u.loc.trim().length > 0));

		async function saveSitemap() {
			if (!isValidSitemap()) return;

			savingSitemap = true;

			try {
				const payload = {
					mode: sitemap.mode,
					urls: sitemap.mode !== "off"
						? sitemap.urls.map((u) => ({ loc: u.loc.trim() })).filter((u) => u.loc.length > 0)
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
				savingSitemap = false;
			}
		}

		async function saveMaintenanceNotificationSettings() {
			const bufferHours = Number(maintenanceNotificationSettings.reminder_buffer_hours);

			if (!Number.isFinite(bufferHours) || bufferHours < 1) {
				toast.error("Reminder buffer hours must be a number of at least 1");

				return;
			}

			savingMaintenanceNotificationSettings = true;

			try {
				const payload = {
					event_types: {
						created: maintenanceNotificationSettings.event_types.created,
						reminder: maintenanceNotificationSettings.event_types.reminder,
						started: maintenanceNotificationSettings.event_types.started,
						ended: maintenanceNotificationSettings.event_types.ended
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
					maintenanceNotificationSettings.reminder_buffer_hours = payload.reminder_buffer_hours;
					toast.success("Maintenance notification settings saved successfully");
				}
			} catch(e) {
				toast.error("Failed to save maintenance notification settings");
			} finally {
				savingMaintenanceNotificationSettings = false;
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
				uploadingLogo = true;
			} else if (type === "favicon") {
				uploadingFavicon = true;
			} else {
				uploadingSocialPreviewImage = true;
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
						siteData.logo = result.url;
					} else if (type === "socialPreviewImage") {
						siteData.socialPreviewImage = result.url;
					} else {
						siteData.favicon = result.url;
					}

					toast.success(`${type === "logo"
						? "Logo"
						: type === "favicon" ? "Favicon" : "Social preview image"} uploaded successfully`);
				}
			} catch(e) {
				toast.error(`Failed to upload ${type}`);
			} finally {
				if (type === "logo") {
					uploadingLogo = false;
				} else if (type === "favicon") {
					uploadingFavicon = false;
				} else {
					uploadingSocialPreviewImage = false;
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

			nav[index].uploading = true;

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
					nav[index].iconURL = result.url;
				}
			} catch(e) {
				toast.error("Failed to upload icon");
			} finally {
				nav[index].uploading = false;
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
				siteData.logo = "";
			} else if (type === "favicon") {
				siteData.favicon = "";
			} else {
				siteData.socialPreviewImage = null;
			}
		}

		function addNavItem() {
			nav = [...nav, { name: "", url: "", iconURL: "" }];
		}

		function removeNavItem(index) {
			nav = nav.filter((_, i) => i !== index);
		}

		onMount(() => {
			currentOrigin = window.location.origin;
			void fetchSiteData();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-4 p-4">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);
				Spinner($$renderer, {});
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Site Information`);
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
													$$renderer.push(`<!---->Basic information about your status page`);
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
									class: 'space-y-4',
									children: ($$renderer) => {
										$$renderer.push(`<div class="grid gap-4 md:grid-cols-2"><div class="space-y-2">`);

										Label($$renderer, {
											for: 'siteName',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Site Name *`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'siteName',
											type: 'text',
											placeholder: 'My Status Page',
											get value() {
												return siteData.siteName;
											},

											set value($$value) {
												siteData.siteName = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">The name displayed in the header and browser tab</p></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'siteURL',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Site URL *`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'siteURL',
											type: 'url',
											placeholder: 'https://status.example.com',
											get value() {
												return siteData.siteURL;
											},

											set value($$value) {
												siteData.siteURL = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										if (siteData.siteURL.trim().length > 0 && !isOriginOnlySiteURL()) {
											$$renderer.push(`<!--[0--><p class="text-destructive text-xs">Invalid site URL. Please enter only protocol + domain (no path, query, or hash).</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (siteData.siteURL.trim().length > 0 && isOriginOnlySiteURL() && hasOriginMismatch()) {
											$$renderer.push(`<!--[0--><p class="text-xs text-amber-600 dark:text-amber-400">Warning: Entered origin (${$.escape(enteredSiteOrigin())}) does not match current origin (${$.escape(currentOrigin)}).</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <p class="text-muted-foreground text-xs">Effective URL: ${$.escape((isOriginOnlySiteURL() ? enteredSiteOrigin() : siteData.siteURL) + clientResolver(resolve, "/"))}</p></div></div>`);
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
											onclick: saveSiteInfo,
											disabled: savingSiteInfo || !isValidSiteInfo(),
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingSiteInfo) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Logo`);
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
													$$renderer.push(`<!---->Upload your site logo (max 256x256px, PNG/JPG/SVG/WebP)`);
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
									class: 'space-y-4',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-start gap-4"><div class="bg-muted flex h-24 w-24 items-center justify-center rounded-lg border">`);

										if (siteData.logo) {
											$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, siteData.logo))} alt="Logo" class="max-h-20 max-w-20 object-contain"/>`);
										} else {
											$$renderer.push('<!--[-1-->');
											ImageIcon($$renderer, { class: 'text-muted-foreground h-8 w-8' });
										}

										$$renderer.push(`<!--]--></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2">`);

										Button($$renderer, {
											variant: 'outline',
											disabled: uploadingLogo,
											onclick: () => document.getElementById("logo-input")?.click(),
											children: ($$renderer) => {
												if (uploadingLogo) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Uploading...`);
												} else {
													$$renderer.push('<!--[-1-->');
													UploadIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Upload Logo`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <input id="logo-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"${$.attr('disabled', uploadingLogo, true)}/> `);

										if (siteData.logo) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												variant: 'ghost',
												size: 'icon',
												onclick: () => clearImage("logo"),
												children: ($$renderer) => {
													XIcon($$renderer, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> `);

										if (siteData.logo) {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground truncate text-xs">${$.escape(siteData.logo)}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
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

							$$renderer.push(` `);

							if (Card.Footer) {
								$$renderer.push('<!--[-->');

								Card.Footer($$renderer, {
									class: 'flex justify-end',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveLogo,
											disabled: savingLogo,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingLogo) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Favicon`);
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
													$$renderer.push(`<!---->Upload your site favicon (max 64x64px, PNG/JPG/SVG/WebP)`);
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
									class: 'space-y-4',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-start gap-4"><div class="bg-muted flex h-16 w-16 items-center justify-center rounded-lg border">`);

										if (siteData.favicon) {
											$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, siteData.favicon))} alt="Favicon" class="max-h-12 max-w-12 object-contain"/>`);
										} else {
											$$renderer.push('<!--[-1-->');
											ImageIcon($$renderer, { class: 'text-muted-foreground h-6 w-6' });
										}

										$$renderer.push(`<!--]--></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2">`);

										Button($$renderer, {
											variant: 'outline',
											disabled: uploadingFavicon,
											onclick: () => document.getElementById("favicon-input")?.click(),
											children: ($$renderer) => {
												if (uploadingFavicon) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Uploading...`);
												} else {
													$$renderer.push('<!--[-1-->');
													UploadIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Upload Favicon`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <input id="favicon-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"${$.attr('disabled', uploadingFavicon, true)}/> `);

										if (siteData.favicon) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												variant: 'ghost',
												size: 'icon',
												onclick: () => clearImage("favicon"),
												children: ($$renderer) => {
													XIcon($$renderer, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> `);

										if (siteData.favicon) {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground truncate text-xs">${$.escape(siteData.favicon)}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
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

							$$renderer.push(` `);

							if (Card.Footer) {
								$$renderer.push('<!--[-->');

								Card.Footer($$renderer, {
									class: 'flex justify-end',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveFavicon,
											disabled: savingFavicon,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingFavicon) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Social Preview &amp; SEO`);
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
													$$renderer.push(`<!---->Configure social preview image and meta tags for search engines`);
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
									class: 'space-y-4',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-start gap-4"><div class="bg-muted flex h-32 w-64 items-center justify-center rounded-lg border">`);

										if (siteData.socialPreviewImage) {
											$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, siteData.socialPreviewImage))} alt="Social preview" class="h-full w-full rounded-lg object-cover"/>`);
										} else {
											$$renderer.push('<!--[-1-->');
											ImageIcon($$renderer, { class: 'text-muted-foreground h-8 w-8' });
										}

										$$renderer.push(`<!--]--></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2">`);

										Button($$renderer, {
											variant: 'outline',
											disabled: uploadingSocialPreviewImage,
											onclick: () => document.getElementById("social-preview-image-input")?.click(),
											children: ($$renderer) => {
												if (uploadingSocialPreviewImage) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Uploading...`);
												} else {
													$$renderer.push('<!--[-1-->');
													UploadIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Upload Social Preview`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <input id="social-preview-image-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"${$.attr('disabled', uploadingSocialPreviewImage, true)}/> `);

										if (siteData.socialPreviewImage) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												variant: 'ghost',
												size: 'icon',
												onclick: () => clearImage("socialPreviewImage"),
												children: ($$renderer) => {
													XIcon($$renderer, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> `);

										if (siteData.socialPreviewImage) {
											$$renderer.push(`<!--[0--><p class="text-muted-foreground truncate text-xs">${$.escape(siteData.socialPreviewImage)}</p>`);
										} else {
											$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-xs">Optional. Leave empty to use no social preview image.</p>`);
										}

										$$renderer.push(`<!--]--></div></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'metaSiteTitle',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Meta Title`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'metaSiteTitle',
											type: 'text',
											placeholder: 'Custom page title for search engines',
											get value() {
												return metaSiteTitle;
											},

											set value($$value) {
												metaSiteTitle = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Overrides the default page title in search results</p></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'metaSiteDescription',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Meta Description`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Textarea($$renderer, {
											id: 'metaSiteDescription',
											placeholder: 'Custom description for search engines',
											rows: 3,
											get value() {
												return metaSiteDescription;
											},

											set value($$value) {
												metaSiteDescription = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Shown as the snippet text in search engine results</p></div>`);
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
											onclick: saveSocialPreviewImage,
											disabled: savingSocialPreviewImage,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingSocialPreviewImage) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Navigation Menu`);
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
													$$renderer.push(`<!---->Add custom navigation links to your status page header`);
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
									class: 'space-y-4',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(nav);

										for (let index = 0, $$length = each_array.length; index < $$length; index++) {
											let item = each_array[index];

											$$renderer.push(`<div class="flex items-end gap-2 rounded-lg border p-3"><div class="grid flex-1 gap-2 sm:grid-cols-3"><div class="space-y-1">`);

											Label($$renderer, {
												for: `nav-name-${$.stringify(index)}`,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Name`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: `nav-name-${$.stringify(index)}`,
												type: 'text',
												placeholder: 'Documentation',
												get value() {
													return item.name;
												},

												set value($$value) {
													item.name = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> <div class="space-y-1">`);

											Label($$renderer, {
												for: `nav-url-${$.stringify(index)}`,
												children: ($$renderer) => {
													$$renderer.push(`<!---->URL`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: `nav-url-${$.stringify(index)}`,
												type: 'text',
												placeholder: 'https://docs.example.com',
												get value() {
													return item.url;
												},

												set value($$value) {
													item.url = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> <div class="space-y-1">`);

											Label($$renderer, {
												for: `nav-icon-${$.stringify(index)}`,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Icon`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="flex items-center gap-2">`);

											if (item.iconURL) {
												$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, item.iconURL))} alt="Icon" class="h-6 w-6 object-contain"/> `);

												Button($$renderer, {
													variant: 'ghost',
													size: 'sm',
													onclick: () => item.iconURL = "",
													children: ($$renderer) => {
														XIcon($$renderer, { class: 'h-4 w-4' });
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											} else {
												$$renderer.push('<!--[-1-->');

												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													disabled: item.uploading,
													onclick: () => document.getElementById(`nav-icon-input-${index}`)?.click(),
													children: ($$renderer) => {
														if (item.uploading) {
															$$renderer.push('<!--[0-->');
															Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
														} else {
															$$renderer.push('<!--[-1-->');
															UploadIcon($$renderer, { class: 'h-4 w-4' });
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});
											}

											$$renderer.push(`<!--]--> <input${$.attr('id', `nav-icon-input-${$.stringify(index)}`)} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"/></div></div></div> `);

											Button($$renderer, {
												variant: 'ghost',
												size: 'icon',
												onclick: () => removeNavItem(index),
												children: ($$renderer) => {
													XIcon($$renderer, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										}

										$$renderer.push(`<!--]--> `);

										Button($$renderer, {
											variant: 'outline',
											onclick: addNavItem,
											children: ($$renderer) => {
												Plus($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> Add Navigation Item`);
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

							$$renderer.push(` `);

							if (Card.Footer) {
								$$renderer.push('<!--[-->');

								Card.Footer($$renderer, {
									class: 'flex justify-end',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveNavigation,
											disabled: savingNav,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingNav) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Monitor Sub Menu Options`);
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
													$$renderer.push(`<!---->Configure which options appear in the monitor sub menu on the status page`);
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
									class: 'space-y-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Share Badge`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Show option to get embeddable status and uptime badges for the monitor</p></div> `);

										Switch($$renderer, {
											get checked() {
												return subMenuOptions.showShareBadgeMonitor;
											},

											set checked($$value) {
												subMenuOptions.showShareBadgeMonitor = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Share Embed`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Show option to get iframe or script embed code for the monitor</p></div> `);

										Switch($$renderer, {
											get checked() {
												return subMenuOptions.showShareEmbedMonitor;
											},

											set checked($$value) {
												subMenuOptions.showShareEmbedMonitor = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->RSS Feed`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Show an RSS feed link in the page header. The feed itself is always reachable at /rss.xml.</p></div> `);

										Switch($$renderer, {
											get checked() {
												return subMenuOptions.showRssFeed;
											},

											set checked($$value) {
												subMenuOptions.showRssFeed = $$value;
												$$settled = false;
											}
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
											onclick: saveSubMenuOptions,
											disabled: savingSubMenuOptions,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingSubMenuOptions) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Global Page Visibility Settings`);
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
													$$renderer.push(`<!---->Configure page switcher visibility and global exclusivity behavior for page-linked content.`);
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
									class: 'space-y-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Show page switcher`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">This will hide the pages dropdown from the menu.</p></div> `);

										Switch($$renderer, {
											disabled: globalPageVisibilitySettings.forceExclusivity,
											get checked() {
												return globalPageVisibilitySettings.showSwitcher;
											},

											set checked($$value) {
												globalPageVisibilitySettings.showSwitcher = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Force exclusivity`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">This sets <code>showSwitcher</code> to true and makes it read-only. It also enables brand icon link
              overwrite and calendar event updates for affected monitors. Global events (incidents and maintenances with <code>is_global=YES</code>) are still shown.</p></div> `);

										Switch($$renderer, {
											checked: globalPageVisibilitySettings.forceExclusivity,
											onCheckedChange: onForceExclusivityChange
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
											onclick: saveGlobalPageVisibilitySettings,
											disabled: savingGlobalPageVisibilitySettings,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingGlobalPageVisibilitySettings) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Data Retention Policy`);
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
													$$renderer.push(`<!---->Configure automatic cleanup for old monitor status data`);
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
									class: 'space-y-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Enable Data Retention`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Automatically remove status data older than retention days</p></div> `);

										Switch($$renderer, {
											get checked() {
												return dataRetentionPolicy.enabled;
											},

											set checked($$value) {
												dataRetentionPolicy.enabled = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'retention-days',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Retention Days`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'retention-days',
											type: 'number',
											min: '1',
											disabled: !dataRetentionPolicy.enabled,
											get value() {
												return dataRetentionPolicy.retentionDays;
											},

											set value($$value) {
												dataRetentionPolicy.retentionDays = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Default is 90 days if not configured.</p></div>`);
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
											onclick: saveDataRetentionPolicy,
											disabled: savingDataRetentionPolicy,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingDataRetentionPolicy) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Event Display Settings`);
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
													$$renderer.push(`<!---->Configure which incidents and maintenances are shown on the site`);
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
									class: 'space-y-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center justify-between rounded-lg border p-4"><div class="space-y-0.5">`);

										Label($$renderer, {
											for: 'events-display-inline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Display Events Inline`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Turn on to show events inline on the status page. Off shows them in the notification list.</p></div> `);

										Switch($$renderer, {
											id: 'events-display-inline',
											get checked() {
												return eventDisplaySettings.showInlineEvents;
											},

											set checked($$value) {
												eventDisplaySettings.showInlineEvents = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="space-y-4"><div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Incidents`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Enable or disable incident display globally</p></div> `);

										Switch($$renderer, {
											get checked() {
												return eventDisplaySettings.incidents.enabled;
											},

											set checked($$value) {
												eventDisplaySettings.incidents.enabled = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> `);

										if (eventDisplaySettings.incidents.enabled) {
											$$renderer.push(`<!--[0--><div class="border-muted ml-4 space-y-4 border-l-2 pl-4"><div class="flex items-center justify-between"><div class="space-y-0.5">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Show Ongoing Incidents`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Display active incidents</p></div> `);

											Switch($$renderer, {
												get checked() {
													return eventDisplaySettings.incidents.ongoing.show;
												},

												set checked($$value) {
													eventDisplaySettings.incidents.ongoing.show = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Show Resolved Incidents`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Display recently resolved incidents</p></div> `);

											Switch($$renderer, {
												get checked() {
													return eventDisplaySettings.incidents.resolved.show;
												},

												set checked($$value) {
													eventDisplaySettings.incidents.resolved.show = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> `);

											if (eventDisplaySettings.incidents.resolved.show) {
												$$renderer.push(`<!--[0--><div class="grid gap-4 md:grid-cols-2"><div class="space-y-2">`);

												Label($$renderer, {
													for: 'events-incidents-max-count',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Max Resolved Count`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													id: 'events-incidents-max-count',
													type: 'number',
													min: '1',
													max: '50',
													get value() {
														return eventDisplaySettings.incidents.resolved.maxCount;
													},

													set value($$value) {
														eventDisplaySettings.incidents.resolved.maxCount = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div> <div class="space-y-2">`);

												Label($$renderer, {
													for: 'events-incidents-days-in-past',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Days in Past`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													id: 'events-incidents-days-in-past',
													type: 'number',
													min: '1',
													max: '90',
													get value() {
														return eventDisplaySettings.incidents.resolved.daysInPast;
													},

													set value($$value) {
														eventDisplaySettings.incidents.resolved.daysInPast = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> <hr class="border-muted"/> <div class="space-y-4"><div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Maintenances`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Enable or disable maintenance display globally</p></div> `);

										Switch($$renderer, {
											get checked() {
												return eventDisplaySettings.maintenances.enabled;
											},

											set checked($$value) {
												eventDisplaySettings.maintenances.enabled = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> `);

										if (eventDisplaySettings.maintenances.enabled) {
											$$renderer.push(`<!--[0--><div class="border-muted ml-4 space-y-4 border-l-2 pl-4"><div class="flex items-center justify-between"><div class="space-y-0.5">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Show Ongoing Maintenances`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Display active maintenance windows</p></div> `);

											Switch($$renderer, {
												get checked() {
													return eventDisplaySettings.maintenances.ongoing.show;
												},

												set checked($$value) {
													eventDisplaySettings.maintenances.ongoing.show = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Show Past Maintenances`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Display completed maintenance windows</p></div> `);

											Switch($$renderer, {
												get checked() {
													return eventDisplaySettings.maintenances.past.show;
												},

												set checked($$value) {
													eventDisplaySettings.maintenances.past.show = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> `);

											if (eventDisplaySettings.maintenances.past.show) {
												$$renderer.push(`<!--[0--><div class="grid gap-4 md:grid-cols-2"><div class="space-y-2">`);

												Label($$renderer, {
													for: 'events-maint-past-max-count',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Max Past Count`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													id: 'events-maint-past-max-count',
													type: 'number',
													min: '1',
													max: '50',
													get value() {
														return eventDisplaySettings.maintenances.past.maxCount;
													},

													set value($$value) {
														eventDisplaySettings.maintenances.past.maxCount = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div> <div class="space-y-2">`);

												Label($$renderer, {
													for: 'events-maint-past-days-in-past',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Days in Past`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													id: 'events-maint-past-days-in-past',
													type: 'number',
													min: '1',
													max: '90',
													get value() {
														return eventDisplaySettings.maintenances.past.daysInPast;
													},

													set value($$value) {
														eventDisplaySettings.maintenances.past.daysInPast = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> <div class="flex items-center justify-between"><div class="space-y-0.5">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Show Upcoming Maintenances`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Display scheduled maintenance windows</p></div> `);

											Switch($$renderer, {
												get checked() {
													return eventDisplaySettings.maintenances.upcoming.show;
												},

												set checked($$value) {
													eventDisplaySettings.maintenances.upcoming.show = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> `);

											if (eventDisplaySettings.maintenances.upcoming.show) {
												$$renderer.push(`<!--[0--><div class="grid gap-4 md:grid-cols-2"><div class="space-y-2">`);

												Label($$renderer, {
													for: 'events-maint-upcoming-max-count',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Max Upcoming Count`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													id: 'events-maint-upcoming-max-count',
													type: 'number',
													min: '1',
													max: '50',
													get value() {
														return eventDisplaySettings.maintenances.upcoming.maxCount;
													},

													set value($$value) {
														eventDisplaySettings.maintenances.upcoming.maxCount = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div> <div class="space-y-2">`);

												Label($$renderer, {
													for: 'events-maint-upcoming-days-in-future',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Days in Future`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													id: 'events-maint-upcoming-days-in-future',
													type: 'number',
													min: '1',
													max: '90',
													get value() {
														return eventDisplaySettings.maintenances.upcoming.daysInFuture;
													},

													set value($$value) {
														eventDisplaySettings.maintenances.upcoming.daysInFuture = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div>`);
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
											onclick: saveEventDisplaySettings,
											disabled: savingEventDisplaySettings,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingEventDisplaySettings) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sitemap`);
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
													$$renderer.push(`<!---->Configure how your sitemap.xml is generated`);
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
									class: 'space-y-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="space-y-3">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Mode`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (RadioGroup.Root) {
											$$renderer.push('<!--[-->');

											RadioGroup.Root($$renderer, {
												value: sitemap.mode,
												onValueChange: (v) => {
													sitemap.mode = v;

													if (v === "manual" && sitemap.urls.length === 0) {
														sitemap.urls = [{ loc: "" }];
													}
												},
												class: 'flex flex-col gap-3',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'auto', id: 'sitemap-auto' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'sitemap-auto',
														class: 'cursor-pointer font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Auto`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'manual', id: 'sitemap-manual' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'sitemap-manual',
														class: 'cursor-pointer font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Manual`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: 'off', id: 'sitemap-off' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: 'sitemap-off',
														class: 'cursor-pointer font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Off`);
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

										$$renderer.push(` <p class="text-muted-foreground text-xs">`);

										if (sitemap.mode === "auto") {
											$$renderer.push(`<!--[0-->Sitemap will be auto-generated from your monitors and pages. You can also add additional URLs below.`);
										} else if (sitemap.mode === "manual") {
											$$renderer.push(`<!--[1-->Provide custom URLs to include in the sitemap.`);
										} else {
											$$renderer.push(`<!--[-1-->Sitemap generation is disabled.`);
										}

										$$renderer.push(`<!--]--></p></div> `);

										if (sitemap.mode === "manual" || sitemap.mode === "auto") {
											$$renderer.push(`<!--[0--><div class="space-y-3">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(sitemap.mode === "auto" ? "Additional URLs" : "URLs")}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <!--[-->`);

											const each_array_1 = $.ensure_array_like(sitemap.urls);

											for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
												let url = each_array_1[index];

												$$renderer.push(`<div class="flex items-center gap-2">`);

												Input($$renderer, {
													type: 'url',
													placeholder: 'https://example.com/page',
													class: 'flex-1',
													get value() {
														return url.loc;
													},

													set value($$value) {
														url.loc = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'ghost',
													size: 'icon',
													onclick: () => removeSitemapUrl(index),
													disabled: sitemap.mode === "manual" && sitemap.urls.length <= 1,
													children: ($$renderer) => {
														XIcon($$renderer, { class: 'h-4 w-4' });
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----></div>`);
											}

											$$renderer.push(`<!--]--> `);

											Button($$renderer, {
												variant: 'outline',
												onclick: addSitemapUrl,
												children: ($$renderer) => {
													Plus($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> ${$.escape(sitemap.urls.length > 0 ? "Add More URLs" : "Add URL")}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (sitemap.mode === "manual" && sitemap.urls.length === 0) {
												$$renderer.push(`<!--[0--><p class="text-destructive text-xs">At least one URL is required for manual mode.</p>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
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
									class: 'flex justify-end gap-2',
									children: ($$renderer) => {
										if (sitemap.mode !== "off" && sitemapURL()) {
											$$renderer.push('<!--[0-->');

											CopyButton($$renderer, {
												variant: 'outline',
												size: 'default',
												text: sitemapURL(),
												children: ($$renderer) => {
													CopyIcon($$renderer, { class: 'mr-2 h-4 w-4' });
													$$renderer.push(`<!----> Copy URL`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												variant: 'outline',
												class: 'cursor-pointer',
												onclick: () => window.open(clientResolver(resolve, "/sitemap.xml"), "_blank"),
												children: ($$renderer) => {
													ExternalLinkIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> View`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Button($$renderer, {
											onclick: saveSitemap,
											disabled: savingSitemap || !isValidSitemap(),
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingSitemap) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Maintenance Notification Settings`);
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
													$$renderer.push(`<!---->Configure which maintenance lifecycle events trigger subscriber notifications`);
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
									class: 'space-y-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="space-y-4">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Event Types`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="grid gap-4 sm:grid-cols-2"><div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Created</p> <p class="text-muted-foreground text-xs">When a maintenance is created</p></div> `);

										Switch($$renderer, {
											checked: maintenanceNotificationSettings.event_types.created,
											onCheckedChange: (v) => {
												maintenanceNotificationSettings.event_types.created = v === true;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Reminder</p> <p class="text-muted-foreground text-xs">Before a scheduled maintenance starts</p></div> `);

										Switch($$renderer, {
											checked: maintenanceNotificationSettings.event_types.reminder,
											onCheckedChange: (v) => {
												maintenanceNotificationSettings.event_types.reminder = v === true;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Started</p> <p class="text-muted-foreground text-xs">When a maintenance begins</p></div> `);

										Switch($$renderer, {
											checked: maintenanceNotificationSettings.event_types.started,
											onCheckedChange: (v) => {
												maintenanceNotificationSettings.event_types.started = v === true;
											}
										});

										$$renderer.push(`<!----></div> <div class="flex items-center justify-between gap-2 rounded-lg border p-3"><div><p class="text-sm font-medium">Ended</p> <p class="text-muted-foreground text-xs">When a maintenance completes</p></div> `);

										Switch($$renderer, {
											checked: maintenanceNotificationSettings.event_types.ended,
											onCheckedChange: (v) => {
												maintenanceNotificationSettings.event_types.ended = v === true;
											}
										});

										$$renderer.push(`<!----></div></div></div> `);

										if (maintenanceNotificationSettings.event_types.reminder) {
											$$renderer.push(`<!--[0--><div class="space-y-2">`);

											Label($$renderer, {
												for: 'reminder-buffer-hours',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Reminder Buffer (hours)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'reminder-buffer-hours',
												type: 'number',
												min: 1,
												get value() {
													return maintenanceNotificationSettings.reminder_buffer_hours;
												},

												set value($$value) {
													maintenanceNotificationSettings.reminder_buffer_hours = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">How many hours before the maintenance start time to send the reminder notification</p></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
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
									class: 'flex justify-end',
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: saveMaintenanceNotificationSettings,
											disabled: savingMaintenanceNotificationSettings,
											class: 'cursor-pointer',
											children: ($$renderer) => {
												if (savingMaintenanceNotificationSettings) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Saving...`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Save`);
												}

												$$renderer.push(`<!--]-->`);
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