import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { goto } from "$app/navigation";
import * as Card from "$lib/components/ui/card/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { toast } from "svelte-sonner";
import Loader from "@lucide/svelte/icons/loader";
import SaveIcon from "@lucide/svelte/icons/save";
import PlusIcon from "@lucide/svelte/icons/plus";
import XIcon from "@lucide/svelte/icons/x";
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
import UploadIcon from "@lucide/svelte/icons/upload";
import ImageIcon from "@lucide/svelte/icons/image";
import TrashIcon from "@lucide/svelte/icons/trash";
import { mode } from "mode-watcher";
import CodeMirror from "svelte-codemirror-editor";
import { onMount } from "svelte";
import { markdown } from "@codemirror/lang-markdown";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import GC from "$lib/global-constants.js";

var root = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`Path <span class="text-destructive">*</span>`, 1);
var root_4 = $.from_html(`Title <span class="text-destructive">*</span>`, 1);
var root_5 = $.from_html(`Header <span class="text-destructive">*</span>`, 1);
var root_6 = $.from_html(`<img alt="Logo" class="max-h-14 max-w-14 object-contain"/>`);
var root_7 = $.from_html(`<!> Uploading...`, 1);
var root_8 = $.from_html(`<!> Upload`, 1);
var root_9 = $.from_html(`<div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs"> </p></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Page title shown in browser tab</p></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Main heading displayed on the page</p></div> <div class="space-y-2"><!> <div class="overflow-hidden rounded-md border"><!></div> <p class="text-muted-foreground text-xs">Supports Markdown. Optional content below the header.</p></div> <div class="space-y-2"><!> <div class="flex items-start gap-4"><div class="bg-muted flex h-16 w-16 items-center justify-center rounded-lg border"><!></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2"><!> <input id="page-logo-input" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/heic,image/heif" class="hidden"/> <!></div> <p class="text-muted-foreground text-xs">Optional logo for this page (max 256x256px)</p></div></div></div>`, 1);
var root_10 = $.from_html(`<!> `, 1);
var root_11 = $.from_html(`<div class="text-muted-foreground px-2 py-1 text-sm">No available monitors</div>`);
var root_12 = $.from_html(`<!> Add`, 1);
var root_13 = $.from_html(`<div class="bg-muted flex items-center justify-between rounded-lg p-3"><div><p class="font-medium"> </p> <p class="text-muted-foreground text-xs"> </p></div> <div class="flex items-center gap-1"><!> <!> <!></div></div>`);
var root_14 = $.from_html(`<div class="space-y-2"></div>`);
var root_15 = $.from_html(`<div class="text-muted-foreground bg-muted rounded-lg p-4 text-center text-sm">No monitors added to this page yet</div>`);
var root_16 = $.from_html(`<div class="flex gap-2"><!> <!></div> <div class="space-y-2"><!> <!></div>`, 1);
var root_17 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_18 = $.from_html(`<div class="space-y-4"><div><!> <p class="text-muted-foreground text-sm">Configure how many days of status history to display on the status page</p></div> <div class="grid grid-cols-2 gap-4"><div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Number of days shown on desktop screens</p></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Number of days shown on mobile screens</p></div></div></div> <hr class="border-muted"/> <div class="space-y-4"><div><!> <p class="text-muted-foreground text-sm">Choose how monitors are displayed on the status page</p></div> <!> <p class="text-muted-foreground text-xs">Default is <code class="bg-muted rounded px-1 font-mono">default-list</code></p></div>`, 1);
var root_19 = $.from_html(`<!> Saving...`, 1);
var root_20 = $.from_html(`<!> Save Preferences`, 1);
var root_21 = $.from_html(`<img alt="Social preview" class="h-full w-full rounded-lg object-cover"/>`);
var root_22 = $.from_html(`<!> Upload Social Preview`, 1);
var root_23 = $.from_html(`<p class="text-muted-foreground truncate text-xs"> </p>`);
var root_24 = $.from_html(`<p class="text-muted-foreground text-xs">Optional. Leave empty to use site default.</p>`);
var root_25 = $.from_html(`<div class="flex items-start gap-4"><div class="bg-muted flex h-32 w-64 items-center justify-center rounded-lg border"><!></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2"><!> <input id="page-social-preview-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"/> <!></div> <!></div></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Overrides the default page title in search results</p></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Shown as the snippet text in search engine results</p></div>`, 1);
var root_26 = $.from_html(`<!> Save`, 1);
var root_27 = $.from_html(`<div class="space-y-2"><!> <p class="text-muted-foreground text-sm">Once you delete a page, there is no going back. Please be certain.</p> <p class="text-muted-foreground text-sm">Type <code class="bg-muted rounded px-1 font-mono"> </code> to confirm:</p> <!></div>`);
var root_28 = $.from_html(`<!> Deleting...`, 1);
var root_29 = $.from_html(`<!> Delete Page`, 1);
var root_30 = $.from_html(`<div class="flex items-center justify-between"><!> <div><!></div></div> <!> <!>`, 1);
var root_31 = $.from_html(`<div class="container space-y-6 py-6"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Default page settings
	const defaultPageSettings = {
		monitor_status_history_days: {
			desktop: GC.DEFAULT_STATUS_HISTORY_DAYS_DESKTOP,
			mobile: GC.DEFAULT_STATUS_HISTORY_DAYS_MOBILE
		},
		monitor_layout_style: GC.DEFAULT_MONITOR_LAYOUT_STYLE
	};

	// Get page ID from URL params
	const pageId = $.derived(() => page.params.page_id);

	const isNew = $.derived(() => $.get(pageId) === "new");

	// State
	let loading = $.state(true);

	let saving = $.state(false);
	let savingMonitors = false;
	let uploadingLogo = $.state(false);
	let uploadingSocialPreview = $.state(false);

	// Page data
	let currentPage = $.state(null);

	let monitors = $.state($.proxy([]));

	// Form state
	let formData = $.state($.proxy({
		page_path: "",
		page_title: "",
		page_header: "",
		page_subheader: "",
		page_logo: ""
	}));

	// Monitor selection
	let selectedMonitorTag = $.state("");

	let selectedMonitors = $.state($.proxy([]));
	let addingMonitor = $.state(false);
	let removingMonitor = $.state(null);
	let reordering = $.state(false);

	// Delete state
	let deleteConfirmText = $.state("");

	let deleting = $.state(false);
	const canDelete = $.derived(() => !$.get(isNew) && $.get(currentPage) && $.get(currentPage).page_path !== "" && $.get(deleteConfirmText) === `delete ${$.get(currentPage)?.page_path || "home"}`);

	// Page settings state
	let pageSettings = $.state($.proxy(structuredClone(defaultPageSettings)));

	const isHistoryDesktopValid = $.derived(() => Number.isInteger($.get(pageSettings).monitor_status_history_days.desktop) && $.get(pageSettings).monitor_status_history_days.desktop >= GC.STATUS_HISTORY_DAYS_MIN && $.get(pageSettings).monitor_status_history_days.desktop <= GC.STATUS_HISTORY_DAYS_MAX);
	const isHistoryMobileValid = $.derived(() => Number.isInteger($.get(pageSettings).monitor_status_history_days.mobile) && $.get(pageSettings).monitor_status_history_days.mobile >= GC.STATUS_HISTORY_DAYS_MIN && $.get(pageSettings).monitor_status_history_days.mobile <= GC.STATUS_HISTORY_DAYS_MAX);
	let savingDisplaySettings = $.state(false);
	let savingSeoSettings = $.state(false);

	// Validation
	const isFormValid = $.derived(() => $.get(formData).page_title.trim().length > 0 && $.get(formData).page_header.trim().length > 0);

	async function fetchPage() {
		if ($.get(isNew)) {
			$.set(loading, false);

			return;
		}

		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getPages" })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
				goto(clientResolver(resolve, "/manage/app/pages"));

				return;
			}

			const foundPage = result.find((p) => p.id === parseInt($.get(pageId) || "0"));

			if (foundPage) {
				$.set(currentPage, foundPage, true);

				$.set(
					formData,
					{
						page_path: foundPage.page_path,
						page_title: foundPage.page_title,
						page_header: foundPage.page_header,
						page_subheader: foundPage.page_subheader || "",
						page_logo: foundPage.page_logo || ""
					},
					true
				);

				$.set(selectedMonitors, foundPage.monitors?.map((m) => m.monitor_tag) || [], true);

				// Load page settings with defaults
				if (foundPage.page_settings_json) {
					try {
						const parsed = typeof foundPage.page_settings_json === "string"
							? JSON.parse(foundPage.page_settings_json)
							: foundPage.page_settings_json;

						$.set(pageSettings, { ...structuredClone(defaultPageSettings), ...parsed }, true);
					} catch {
						$.set(pageSettings, structuredClone(defaultPageSettings), true);
					}
				} else {
					$.set(pageSettings, structuredClone(defaultPageSettings), true);
				}
			} else {
				toast.error("Page not found");
				goto(clientResolver(resolve, "/manage/app/pages"));
			}
		} catch(e) {
			toast.error("Failed to load page");
			goto(clientResolver(resolve, "/manage/app/pages"));
		} finally {
			$.set(loading, false);
		}
	}

	async function fetchMonitors() {
		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getMonitors", data: {} })
			});

			const result = await response.json();

			if (!result.error) {
				$.set(monitors, result, true);
			}
		} catch(e) {
			console.error("Failed to fetch monitors", e);
		}
	}

	async function savePage() {
		if (!$.get(isFormValid)) return;

		$.set(saving, true);

		try {
			const action = $.get(isNew) ? "createPage" : "updatePage";

			// Make page_path URL-friendly: lowercase, replace spaces with hyphens, remove special chars
			const sanitizedPath = $.get(formData).page_path.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");

			const data = {
				page_path: sanitizedPath,
				page_title: $.get(formData).page_title,
				page_header: $.get(formData).page_header,
				page_subheader: $.get(formData).page_subheader || null,
				page_logo: $.get(formData).page_logo || null
			};

			if (!$.get(isNew) && $.get(currentPage)) {
				data.id = $.get(currentPage).id;
			}

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action, data })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success($.get(isNew)
					? "Page created successfully"
					: "Page updated successfully");

				if ($.get(isNew) && result.id) {
					// Navigate to the newly created page
					goto(clientResolver(resolve, `/manage/app/pages/${result.id}`));
				} else if ($.get(isNew)) {
					// Fallback: go back to pages list
					goto(clientResolver(resolve, "/manage/app/pages"));
				}
			}
		} catch(e) {
			toast.error($.get(isNew) ? "Failed to create page" : "Failed to update page");
		} finally {
			$.set(saving, false);
		}
	}

	async function addMonitorToPage() {
		if (!$.get(currentPage) || !$.get(selectedMonitorTag)) return;

		$.set(addingMonitor, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "addMonitorToPage",
					data: {
						page_id: $.get(currentPage).id,
						monitor_tag: $.get(selectedMonitorTag)
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Monitor added to page");
				$.set(selectedMonitors, [...$.get(selectedMonitors), $.get(selectedMonitorTag)], true);
				$.set(selectedMonitorTag, "");
			}
		} catch(e) {
			toast.error("Failed to add monitor");
		} finally {
			$.set(addingMonitor, false);
		}
	}

	async function deletePage() {
		if (!$.get(currentPage) || !$.get(canDelete)) return;

		$.set(deleting, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "deletePage", data: { id: $.get(currentPage).id } })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Page deleted successfully");
				goto(clientResolver(resolve, "/manage/app/pages"));
			}
		} catch(e) {
			toast.error("Failed to delete page");
		} finally {
			$.set(deleting, false);
		}
	}

	async function removeMonitorFromPage(monitorTag) {
		if (!$.get(currentPage)) return;

		$.set(removingMonitor, monitorTag, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "removeMonitorFromPage",
					data: { page_id: $.get(currentPage).id, monitor_tag: monitorTag }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Monitor removed from page");
				$.set(selectedMonitors, $.get(selectedMonitors).filter((t) => t !== monitorTag), true);
			}
		} catch(e) {
			toast.error("Failed to remove monitor");
		} finally {
			$.set(removingMonitor, null);
		}
	}

	// Get available monitors (not already on the current page)
	const availableMonitors = $.derived(() => $.get(monitors).filter((m) => !$.get(selectedMonitors).includes(m.tag)));

	async function moveMonitor(index, direction) {
		const newIndex = direction === "up" ? index - 1 : index + 1;

		if (newIndex < 0 || newIndex >= $.get(selectedMonitors).length) return;

		const updated = [...$.get(selectedMonitors)];

		[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
		$.set(selectedMonitors, updated, true);

		if (!$.get(currentPage)) return;

		$.set(reordering, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "reorderPageMonitors",
					data: {
						page_id: $.get(currentPage).id,
						monitor_tags: $.get(selectedMonitors)
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			}
		} catch(e) {
			toast.error("Failed to reorder monitors");
		} finally {
			$.set(reordering, false);
		}
	}

	// Image upload functions
	async function handleLogoUpload(event) {
		const input = event.target;
		const file = input.files?.[0];

		if (!file) return;

		// Validate file type
		const allowedTypes = [
			"image/png",
			"image/jpeg",
			"image/jpg",
			"image/svg+xml",
			"image/webp"
		];

		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type. Allowed: PNG, JPG, SVG, WebP");

			return;
		}

		// Validate file size (max 2MB)
		if (file.size > GC.MAX_UPLOAD_BYTES) {
			toast.error(`File too large. Maximum size is ${GC.MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);

			return;
		}

		$.set(uploadingLogo, true);

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
						maxWidth: 256,
						maxHeight: 256,
						prefix: "page_logo_"
					}
				})
			});

			if (!response.ok) {
				toast.error("Failed to upload logo");

				return;
			}

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.get(formData).page_logo = result.url;
				toast.success("Logo uploaded successfully");
			}
		} catch(e) {
			toast.error("Failed to upload logo");
		} finally {
			$.set(uploadingLogo, false);
			input.value = "";
		}
	}

	function fileToBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.readAsDataURL(file);

			reader.onload = () => {
				const result = reader.result;
				const base64 = result.split(",")[1];

				resolve(base64);
			};

			reader.onerror = (error) => reject(error);
		});
	}

	function clearLogo() {
		$.get(formData).page_logo = "";
	}

	function clearSocialPreview() {
		$.get(pageSettings).socialPagePreviewImage = "";
	}

	async function handleSocialPreviewUpload(event) {
		const input = event.target;
		const file = input.files?.[0];

		if (!file) return;

		const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type. Allowed: PNG, JPG, WebP");

			return;
		}

		if (file.size > GC.MAX_UPLOAD_BYTES) {
			toast.error(`File too large. Maximum size is ${GC.MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);

			return;
		}

		$.set(uploadingSocialPreview, true);

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
						maxWidth: 1200,
						maxHeight: 630,
						prefix: "page_social_"
					}
				})
			});

			if (!response.ok) {
				toast.error("Failed to upload social preview image");

				return;
			}

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.get(pageSettings).socialPagePreviewImage = result.url;
				toast.success("Social preview image uploaded");
			}
		} catch(e) {
			toast.error("Failed to upload social preview image");
		} finally {
			$.set(uploadingSocialPreview, false);
			input.value = "";
		}
	}

	async function savePageSettings(source) {
		if (!$.get(currentPage)) return;

		if (source === "display" && (!$.get(isHistoryDesktopValid) || !$.get(isHistoryMobileValid))) {
			toast.error(`Days must be a whole number between ${GC.STATUS_HISTORY_DAYS_MIN} and ${GC.STATUS_HISTORY_DAYS_MAX}`);

			return;
		}

		if (source === "display") $.set(savingDisplaySettings, true); else $.set(savingSeoSettings, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "updatePage",
					data: {
						id: $.get(currentPage).id,
						page_settings_json: JSON.stringify($.get(pageSettings))
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Page settings saved successfully");
			}
		} catch(e) {
			toast.error("Failed to save page settings");
		} finally {
			if (source === "display") $.set(savingDisplaySettings, false); else $.set(savingSeoSettings, false);
		}
	}

	onMount(() => {
		void fetchPage();
		void fetchMonitors();
	});

	var div = root_31();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, { class: 'size-8' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_14 = ($$anchor) => {
			var fragment = root_30();
			var div_2 = $.first_child(fragment);
			var node_2 = $.child(div_2);

			$.component(node_2, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
				Breadcrumb_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
							Breadcrumb_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
										Breadcrumb_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_5 = $.first_child(fragment_3);

												{
													let $0 = $.derived(() => clientResolver(resolve, "/manage/app/pages"));

													$.component(node_5, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
														Breadcrumb_Link($$anchor, {
															get href() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Pages');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_4, 2);

									$.component(node_6, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
										Breadcrumb_Separator($$anchor, {});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
										Breadcrumb_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_8 = $.first_child(fragment_4);

												$.component(node_8, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
													Breadcrumb_Page($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text();

															$.template_effect(() => $.set_text(text_1, $.get(isNew)
																? "New Page"
																: $.get(currentPage)?.page_title || "Edit Page"));

															$.append($$anchor, text_1);
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

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var div_3 = $.sibling(node_2, 2);
			var node_9 = $.child(div_3);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => clientResolver(resolve, `/${$.get(currentPage)?.page_path}`));

						Button($$anchor, {
							variant: 'outline',
							target: '_blank',
							size: 'sm',
							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('View');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_9, ($$render) => {
					if (!$.get(isNew)) $$render(consequent_1);
				});
			}

			$.reset(div_3);
			$.reset(div_2);

			var node_10 = $.sibling(div_2, 2);

			$.component(node_10, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_11 = $.first_child(fragment_7);

						$.component(node_11, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var node_12 = $.first_child(fragment_8);

									$.component(node_12, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('General Information');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text();

												$.template_effect(() => $.set_text(text_4, $.get(isNew) ? "Create a new status page" : "Update page settings"));
												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_11, 2);

						$.component(node_14, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'space-y-4',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_9();
									var div_4 = $.first_child(fragment_10);
									var node_15 = $.child(div_4);

									Label(node_15, {
										for: 'page-path',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_11 = root_3();

											$.next();
											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});

									var node_16 = $.sibling(node_15, 2);

									{
										let $0 = $.derived(() => !$.get(isNew) && $.get(currentPage)?.page_path === "");

										Input(node_16, {
											id: 'page-path',
											type: 'text',
											get disabled() {
												return $.get($0);
											},

											get value() {
												return $.get(formData).page_path;
											},

											set value($$value) {
												$.get(formData).page_path = $$value;
											}
										});
									}

									var p_1 = $.sibling(node_16, 2);
									var text_5 = $.only_child(p_1, true);

									$.reset(div_4);

									var div_5 = $.sibling(div_4, 2);
									var node_17 = $.child(div_5);

									Label(node_17, {
										for: 'page-title',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_12 = root_4();

											$.next();
											$.append($$anchor, fragment_12);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									Input(node_18, {
										id: 'page-title',
										type: 'text',
										placeholder: 'Services Status',
										get value() {
											return $.get(formData).page_title;
										},

										set value($$value) {
											$.get(formData).page_title = $$value;
										}
									});

									$.next(2);
									$.reset(div_5);

									var div_6 = $.sibling(div_5, 2);
									var node_19 = $.child(div_6);

									Label(node_19, {
										for: 'page-header',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_13 = root_5();

											$.next();
											$.append($$anchor, fragment_13);
										},
										$$slots: { default: true }
									});

									var node_20 = $.sibling(node_19, 2);

									Input(node_20, {
										id: 'page-header',
										type: 'text',
										placeholder: 'Services Status',
										get value() {
											return $.get(formData).page_header;
										},

										set value($$value) {
											$.get(formData).page_header = $$value;
										}
									});

									$.next(2);
									$.reset(div_6);

									var div_7 = $.sibling(div_6, 2);
									var node_21 = $.child(div_7);

									Label(node_21, {
										for: 'page-subheader',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Page Content');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var div_8 = $.sibling(node_21, 2);
									var node_22 = $.child(div_8);

									{
										let $0 = $.derived(markdown);
										let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

										CodeMirror(node_22, {
											get lang() {
												return $.get($0);
											},

											get theme() {
												return $.get($1);
											},
											styles: { "&": { width: "100%", maxWidth: "100%", height: "160px" } },
											get value() {
												return $.get(formData).page_subheader;
											},

											set value($$value) {
												$.get(formData).page_subheader = $$value;
											}
										});
									}

									$.reset(div_8);
									$.next(2);
									$.reset(div_7);

									var div_9 = $.sibling(div_7, 2);
									var node_23 = $.child(div_9);

									Label(node_23, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Page Logo');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var div_10 = $.sibling(node_23, 2);
									var div_11 = $.child(div_10);
									var node_24 = $.child(div_11);

									{
										var consequent_2 = ($$anchor) => {
											var img = root_6();

											$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => clientResolver(resolve, $.get(formData).page_logo)]);
											$.append($$anchor, img);
										};

										var alternate = ($$anchor) => {
											ImageIcon($$anchor, { class: 'text-muted-foreground h-6 w-6' });
										};

										$.if(node_24, ($$render) => {
											if ($.get(formData).page_logo) $$render(consequent_2); else $$render(alternate, -1);
										});
									}

									$.reset(div_11);

									var div_12 = $.sibling(div_11, 2);
									var div_13 = $.child(div_12);
									var node_25 = $.child(div_13);

									Button(node_25, {
										variant: 'outline',
										size: 'sm',
										get disabled() {
											return $.get(uploadingLogo);
										},
										onclick: () => document.getElementById("page-logo-input")?.click(),
										children: ($$anchor, $$slotProps) => {
											var fragment_15 = $.comment();
											var node_26 = $.first_child(fragment_15);

											{
												var consequent_3 = ($$anchor) => {
													var fragment_16 = root_7();
													var node_27 = $.first_child(fragment_16);

													Loader(node_27, { class: 'h-4 w-4 animate-spin' });
													$.next();
													$.append($$anchor, fragment_16);
												};

												var alternate_1 = ($$anchor) => {
													var fragment_17 = root_8();
													var node_28 = $.first_child(fragment_17);

													UploadIcon(node_28, { class: 'h-4 w-4' });
													$.next();
													$.append($$anchor, fragment_17);
												};

												$.if(node_26, ($$render) => {
													if ($.get(uploadingLogo)) $$render(consequent_3); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});

									var input_1 = $.sibling(node_25, 2);
									var node_29 = $.sibling(input_1, 2);

									{
										var consequent_4 = ($$anchor) => {
											Button($$anchor, {
												variant: 'ghost',
												size: 'sm',
												onclick: clearLogo,
												children: ($$anchor, $$slotProps) => {
													XIcon($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										};

										$.if(node_29, ($$render) => {
											if ($.get(formData).page_logo) $$render(consequent_4);
										});
									}

									$.reset(div_13);
									$.next(2);
									$.reset(div_12);
									$.reset(div_10);
									$.reset(div_9);

									$.template_effect(() => {
										$.set_text(text_5, !$.get(isNew) && $.get(currentPage)?.page_path === ""
											? "Home page path cannot be changed"
											: "URL path for the page (e.g., services, infrastructure). Will be made URL-friendly.");

										input_1.disabled = $.get(uploadingLogo);
									});

									$.delegated('change', input_1, handleLogoUpload);
									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_30 = $.sibling(node_14, 2);

						$.component(node_30, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-end',
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => $.get(saving) || !$.get(isFormValid));

										Button($$anchor, {
											onclick: savePage,
											get disabled() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_21 = $.comment();
												var node_31 = $.first_child(fragment_21);

												{
													var consequent_5 = ($$anchor) => {
														var fragment_22 = root_10();
														var node_32 = $.first_child(fragment_22);

														Loader(node_32, { class: 'h-4 w-4 animate-spin' });

														var text_8 = $.sibling(node_32);

														$.template_effect(() => $.set_text(text_8, ` ${$.get(isNew) ? "Creating..." : "Saving..."}`));
														$.append($$anchor, fragment_22);
													};

													var alternate_2 = ($$anchor) => {
														var fragment_23 = root_10();
														var node_33 = $.first_child(fragment_23);

														SaveIcon(node_33, { class: 'h-4 w-4' });

														var text_9 = $.sibling(node_33);

														$.template_effect(() => $.set_text(text_9, ` ${$.get(isNew) ? "Create Page" : "Save Changes"}`));
														$.append($$anchor, fragment_23);
													};

													$.if(node_31, ($$render) => {
														if ($.get(saving)) $$render(consequent_5); else $$render(alternate_2, -1);
													});
												}

												$.append($$anchor, fragment_21);
											},
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_34 = $.sibling(node_10, 2);

			{
				var consequent_22 = ($$anchor) => {
					var fragment_24 = root_17();
					var node_35 = $.first_child(fragment_24);

					$.component(node_35, () => Card.Root, ($$anchor, Card_Root_1) => {
						Card_Root_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_25 = root_2();
								var node_36 = $.first_child(fragment_25);

								$.component(node_36, () => Card.Header, ($$anchor, Card_Header_1) => {
									Card_Header_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_26 = root_2();
											var node_37 = $.first_child(fragment_26);

											$.component(node_37, () => Card.Title, ($$anchor, Card_Title_1) => {
												Card_Title_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('Page Monitors');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});
											});

											var node_38 = $.sibling(node_37, 2);

											$.component(node_38, () => Card.Description, ($$anchor, Card_Description_1) => {
												Card_Description_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text('Select which monitors to display on this page');

														$.append($$anchor, text_11);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_26);
										},
										$$slots: { default: true }
									});
								});

								var node_39 = $.sibling(node_36, 2);

								$.component(node_39, () => Card.Content, ($$anchor, Card_Content_1) => {
									Card_Content_1($$anchor, {
										class: 'space-y-4',
										children: ($$anchor, $$slotProps) => {
											var fragment_27 = root_16();
											var div_14 = $.first_child(fragment_27);
											var node_40 = $.child(div_14);

											$.component(node_40, () => Select.Root, ($$anchor, Select_Root) => {
												Select_Root($$anchor, {
													type: 'single',
													get value() {
														return $.get(selectedMonitorTag);
													},

													set value($$value) {
														$.set(selectedMonitorTag, $$value, true);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_28 = root_2();
														var node_41 = $.first_child(fragment_28);

														$.component(node_41, () => Select.Trigger, ($$anchor, Select_Trigger) => {
															Select_Trigger($$anchor, {
																class: 'flex-1',
																children: ($$anchor, $$slotProps) => {
																	var fragment_29 = $.comment();
																	var node_42 = $.first_child(fragment_29);

																	{
																		var consequent_6 = ($$anchor) => {
																			var text_12 = $.text();

																			$.template_effect(($0) => $.set_text(text_12, $0), [
																				() => $.get(monitors).find((m) => m.tag === $.get(selectedMonitorTag))?.name || $.get(selectedMonitorTag)
																			]);

																			$.append($$anchor, text_12);
																		};

																		var alternate_3 = ($$anchor) => {
																			var text_13 = $.text('Select a monitor to add');

																			$.append($$anchor, text_13);
																		};

																		$.if(node_42, ($$render) => {
																			if ($.get(selectedMonitorTag)) $$render(consequent_6); else $$render(alternate_3, -1);
																		});
																	}

																	$.append($$anchor, fragment_29);
																},
																$$slots: { default: true }
															});
														});

														var node_43 = $.sibling(node_41, 2);

														$.component(node_43, () => Select.Content, ($$anchor, Select_Content) => {
															Select_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_31 = root_2();
																	var node_44 = $.first_child(fragment_31);

																	$.each(node_44, 17, () => $.get(availableMonitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
																		var fragment_32 = $.comment();
																		var node_45 = $.first_child(fragment_32);

																		$.component(node_45, () => Select.Item, ($$anchor, Select_Item) => {
																			Select_Item($$anchor, {
																				get value() {
																					return $.get(monitor).tag;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_14 = $.text();

																					$.template_effect(() => $.set_text(text_14, `${$.get(monitor).name ?? ''} (${$.get(monitor).tag ?? ''})`));
																					$.append($$anchor, text_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_32);
																	});

																	var node_46 = $.sibling(node_44, 2);

																	{
																		var consequent_7 = ($$anchor) => {
																			var div_15 = root_11();

																			$.append($$anchor, div_15);
																		};

																		$.if(node_46, ($$render) => {
																			if ($.get(availableMonitors).length === 0) $$render(consequent_7);
																		});
																	}

																	$.append($$anchor, fragment_31);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_28);
													},
													$$slots: { default: true }
												});
											});

											var node_47 = $.sibling(node_40, 2);

											{
												let $0 = $.derived(() => $.get(addingMonitor) || !$.get(selectedMonitorTag));

												Button(node_47, {
													onclick: addMonitorToPage,
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_34 = $.comment();
														var node_48 = $.first_child(fragment_34);

														{
															var consequent_8 = ($$anchor) => {
																Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
															};

															var alternate_4 = ($$anchor) => {
																var fragment_36 = root_12();
																var node_49 = $.first_child(fragment_36);

																PlusIcon(node_49, { class: 'h-4 w-4' });
																$.next();
																$.append($$anchor, fragment_36);
															};

															$.if(node_48, ($$render) => {
																if ($.get(addingMonitor)) $$render(consequent_8); else $$render(alternate_4, -1);
															});
														}

														$.append($$anchor, fragment_34);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_14);

											var div_16 = $.sibling(div_14, 2);
											var node_50 = $.child(div_16);

											Label(node_50, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Current Monitors');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});

											var node_51 = $.sibling(node_50, 2);

											{
												var consequent_10 = ($$anchor) => {
													var div_17 = root_14();

													$.each(div_17, 22, () => $.get(selectedMonitors), (monitorTag) => monitorTag, ($$anchor, monitorTag, i) => {
														const monitor = $.derived(() => $.get(monitors).find((m) => m.tag === monitorTag));
														var div_18 = root_13();
														var div_19 = $.child(div_18);
														var p_2 = $.child(div_19);
														var text_16 = $.only_child(p_2, true);
														var p_3 = $.sibling(p_2, 2);
														var text_17 = $.only_child(p_3, true);

														$.reset(div_19);

														var div_20 = $.sibling(div_19, 2);
														var node_52 = $.child(div_20);

														{
															let $0 = $.derived(() => $.get(i) === 0 || $.get(reordering));

															Button(node_52, {
																variant: 'ghost',
																size: 'sm',
																onclick: () => moveMonitor($.get(i), "up"),
																get disabled() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	ArrowUpIcon($$anchor, { class: 'h-4 w-4' });
																},
																$$slots: { default: true }
															});
														}

														var node_53 = $.sibling(node_52, 2);

														{
															let $0 = $.derived(() => $.get(i) === $.get(selectedMonitors).length - 1 || $.get(reordering));

															Button(node_53, {
																variant: 'ghost',
																size: 'sm',
																onclick: () => moveMonitor($.get(i), "down"),
																get disabled() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	ArrowDownIcon($$anchor, { class: 'h-4 w-4' });
																},
																$$slots: { default: true }
															});
														}

														var node_54 = $.sibling(node_53, 2);

														{
															let $0 = $.derived(() => $.get(removingMonitor) === monitorTag);

															Button(node_54, {
																variant: 'ghost',
																size: 'sm',
																onclick: () => removeMonitorFromPage(monitorTag),
																get disabled() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_39 = $.comment();
																	var node_55 = $.first_child(fragment_39);

																	{
																		var consequent_9 = ($$anchor) => {
																			Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
																		};

																		var alternate_5 = ($$anchor) => {
																			XIcon($$anchor, { class: 'h-4 w-4' });
																		};

																		$.if(node_55, ($$render) => {
																			if ($.get(removingMonitor) === monitorTag) $$render(consequent_9); else $$render(alternate_5, -1);
																		});
																	}

																	$.append($$anchor, fragment_39);
																},
																$$slots: { default: true }
															});
														}

														$.reset(div_20);
														$.reset(div_18);

														$.template_effect(() => {
															$.set_text(text_16, $.get(monitor)?.name || monitorTag);
															$.set_text(text_17, monitorTag);
														});

														$.append($$anchor, div_18);
													});

													$.reset(div_17);
													$.append($$anchor, div_17);
												};

												var alternate_6 = ($$anchor) => {
													var div_21 = root_15();

													$.append($$anchor, div_21);
												};

												$.if(node_51, ($$render) => {
													if ($.get(selectedMonitors).length > 0) $$render(consequent_10); else $$render(alternate_6, -1);
												});
											}

											$.reset(div_16);
											$.append($$anchor, fragment_27);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_25);
							},
							$$slots: { default: true }
						});
					});

					var node_56 = $.sibling(node_35, 2);

					$.component(node_56, () => Card.Root, ($$anchor, Card_Root_2) => {
						Card_Root_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_42 = root_1();
								var node_57 = $.first_child(fragment_42);

								$.component(node_57, () => Card.Header, ($$anchor, Card_Header_2) => {
									Card_Header_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_43 = root_2();
											var node_58 = $.first_child(fragment_43);

											$.component(node_58, () => Card.Title, ($$anchor, Card_Title_2) => {
												Card_Title_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_18 = $.text('Display Settings');

														$.append($$anchor, text_18);
													},
													$$slots: { default: true }
												});
											});

											var node_59 = $.sibling(node_58, 2);

											$.component(node_59, () => Card.Description, ($$anchor, Card_Description_2) => {
												Card_Description_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_19 = $.text('Configure what content is shown on this status page');

														$.append($$anchor, text_19);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_43);
										},
										$$slots: { default: true }
									});
								});

								var node_60 = $.sibling(node_57, 2);

								$.component(node_60, () => Card.Content, ($$anchor, Card_Content_2) => {
									Card_Content_2($$anchor, {
										class: 'space-y-6',
										children: ($$anchor, $$slotProps) => {
											var fragment_44 = root_18();
											var div_22 = $.first_child(fragment_44);
											var div_23 = $.child(div_22);
											var node_61 = $.child(div_23);

											Label(node_61, {
												class: 'text-base font-medium',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_20 = $.text('Monitor Status History');

													$.append($$anchor, text_20);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_23);

											var div_24 = $.sibling(div_23, 2);
											var div_25 = $.child(div_24);
											var node_62 = $.child(div_25);

											Label(node_62, {
												for: 'history-desktop',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_21 = $.text('Desktop (days)');

													$.append($$anchor, text_21);
												},
												$$slots: { default: true }
											});

											var node_63 = $.sibling(node_62, 2);

											{
												let $0 = $.derived(() => $.get(isHistoryDesktopValid) ? "" : "border-destructive");

												Input(node_63, {
													id: 'history-desktop',
													type: 'number',
													step: '1',
													get min() {
														return GC.STATUS_HISTORY_DAYS_MIN;
													},

													get max() {
														return GC.STATUS_HISTORY_DAYS_MAX;
													},

													get class() {
														return $.get($0);
													},

													get value() {
														return $.get(pageSettings).monitor_status_history_days.desktop;
													},

													set value($$value) {
														$.get(pageSettings).monitor_status_history_days.desktop = $$value;
													}
												});
											}

											$.next(2);
											$.reset(div_25);

											var div_26 = $.sibling(div_25, 2);
											var node_64 = $.child(div_26);

											Label(node_64, {
												for: 'history-mobile',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_22 = $.text('Mobile (days)');

													$.append($$anchor, text_22);
												},
												$$slots: { default: true }
											});

											var node_65 = $.sibling(node_64, 2);

											{
												let $0 = $.derived(() => $.get(isHistoryMobileValid) ? "" : "border-destructive");

												Input(node_65, {
													id: 'history-mobile',
													type: 'number',
													step: '1',
													get min() {
														return GC.STATUS_HISTORY_DAYS_MIN;
													},

													get max() {
														return GC.STATUS_HISTORY_DAYS_MAX;
													},

													get class() {
														return $.get($0);
													},

													get value() {
														return $.get(pageSettings).monitor_status_history_days.mobile;
													},

													set value($$value) {
														$.get(pageSettings).monitor_status_history_days.mobile = $$value;
													}
												});
											}

											$.next(2);
											$.reset(div_26);
											$.reset(div_24);
											$.reset(div_22);

											var div_27 = $.sibling(div_22, 4);
											var div_28 = $.child(div_27);
											var node_66 = $.child(div_28);

											Label(node_66, {
												class: 'text-base font-medium',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_23 = $.text('Monitor Layout Style');

													$.append($$anchor, text_23);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_28);

											var node_67 = $.sibling(div_28, 2);

											$.component(node_67, () => Select.Root, ($$anchor, Select_Root_1) => {
												Select_Root_1($$anchor, {
													type: 'single',
													get value() {
														return $.get(pageSettings).monitor_layout_style;
													},

													set value($$value) {
														$.get(pageSettings).monitor_layout_style = $$value;
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_45 = root_2();
														var node_68 = $.first_child(fragment_45);

														$.component(node_68, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
															Select_Trigger_1($$anchor, {
																class: 'w-full',
																children: ($$anchor, $$slotProps) => {
																	var fragment_46 = $.comment();
																	var node_69 = $.first_child(fragment_46);

																	{
																		var consequent_11 = ($$anchor) => {
																			var text_24 = $.text('Default List');

																			$.append($$anchor, text_24);
																		};

																		var consequent_12 = ($$anchor) => {
																			var text_25 = $.text('Default Grid');

																			$.append($$anchor, text_25);
																		};

																		var consequent_13 = ($$anchor) => {
																			var text_26 = $.text('Compact List');

																			$.append($$anchor, text_26);
																		};

																		var alternate_7 = ($$anchor) => {
																			var text_27 = $.text('Compact Grid');

																			$.append($$anchor, text_27);
																		};

																		$.if(node_69, ($$render) => {
																			if ($.get(pageSettings).monitor_layout_style === "default-list") $$render(consequent_11); else if ($.get(pageSettings).monitor_layout_style === "default-grid") $$render(consequent_12, 1); else if ($.get(pageSettings).monitor_layout_style === "compact-list") $$render(consequent_13, 2); else $$render(alternate_7, -1);
																		});
																	}

																	$.append($$anchor, fragment_46);
																},
																$$slots: { default: true }
															});
														});

														var node_70 = $.sibling(node_68, 2);

														$.component(node_70, () => Select.Content, ($$anchor, Select_Content_1) => {
															Select_Content_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_47 = root_17();
																	var node_71 = $.first_child(fragment_47);

																	$.component(node_71, () => Select.Item, ($$anchor, Select_Item_1) => {
																		Select_Item_1($$anchor, {
																			value: 'default-list',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_28 = $.text('Default List');

																				$.append($$anchor, text_28);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_72 = $.sibling(node_71, 2);

																	$.component(node_72, () => Select.Item, ($$anchor, Select_Item_2) => {
																		Select_Item_2($$anchor, {
																			value: 'default-grid',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_29 = $.text('Default Grid');

																				$.append($$anchor, text_29);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_73 = $.sibling(node_72, 2);

																	$.component(node_73, () => Select.Item, ($$anchor, Select_Item_3) => {
																		Select_Item_3($$anchor, {
																			value: 'compact-list',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_30 = $.text('Compact List');

																				$.append($$anchor, text_30);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_74 = $.sibling(node_73, 2);

																	$.component(node_74, () => Select.Item, ($$anchor, Select_Item_4) => {
																		Select_Item_4($$anchor, {
																			value: 'compact-grid',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_31 = $.text('Compact Grid');

																				$.append($$anchor, text_31);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_47);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_45);
													},
													$$slots: { default: true }
												});
											});

											$.next(2);
											$.reset(div_27);
											$.append($$anchor, fragment_44);
										},
										$$slots: { default: true }
									});
								});

								var node_75 = $.sibling(node_60, 2);

								$.component(node_75, () => Card.Footer, ($$anchor, Card_Footer_1) => {
									Card_Footer_1($$anchor, {
										class: 'flex justify-end',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												onclick: () => savePageSettings("display"),
												get disabled() {
													return $.get(savingDisplaySettings);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_49 = $.comment();
													var node_76 = $.first_child(fragment_49);

													{
														var consequent_14 = ($$anchor) => {
															var fragment_50 = root_19();
															var node_77 = $.first_child(fragment_50);

															Loader(node_77, { class: 'h-4 w-4 animate-spin' });
															$.next();
															$.append($$anchor, fragment_50);
														};

														var alternate_8 = ($$anchor) => {
															var fragment_51 = root_20();
															var node_78 = $.first_child(fragment_51);

															SaveIcon(node_78, { class: 'h-4 w-4' });
															$.next();
															$.append($$anchor, fragment_51);
														};

														$.if(node_76, ($$render) => {
															if ($.get(savingDisplaySettings)) $$render(consequent_14); else $$render(alternate_8, -1);
														});
													}

													$.append($$anchor, fragment_49);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_42);
							},
							$$slots: { default: true }
						});
					});

					var node_79 = $.sibling(node_56, 2);

					$.component(node_79, () => Card.Root, ($$anchor, Card_Root_3) => {
						Card_Root_3($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_52 = root_1();
								var node_80 = $.first_child(fragment_52);

								$.component(node_80, () => Card.Header, ($$anchor, Card_Header_3) => {
									Card_Header_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_53 = root_2();
											var node_81 = $.first_child(fragment_53);

											$.component(node_81, () => Card.Title, ($$anchor, Card_Title_3) => {
												Card_Title_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_32 = $.text('Social Preview & SEO');

														$.append($$anchor, text_32);
													},
													$$slots: { default: true }
												});
											});

											var node_82 = $.sibling(node_81, 2);

											$.component(node_82, () => Card.Description, ($$anchor, Card_Description_3) => {
												Card_Description_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_33 = $.text('Optional social preview image and meta tags for this page. Leave empty to use site defaults.');

														$.append($$anchor, text_33);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_53);
										},
										$$slots: { default: true }
									});
								});

								var node_83 = $.sibling(node_80, 2);

								$.component(node_83, () => Card.Content, ($$anchor, Card_Content_3) => {
									Card_Content_3($$anchor, {
										class: 'space-y-4',
										children: ($$anchor, $$slotProps) => {
											var fragment_54 = root_25();
											var div_29 = $.first_child(fragment_54);
											var div_30 = $.child(div_29);
											var node_84 = $.child(div_30);

											{
												var consequent_15 = ($$anchor) => {
													var img_1 = root_21();

													$.template_effect(($0) => $.set_attribute(img_1, 'src', $0), [
														() => clientResolver(resolve, $.get(pageSettings).socialPagePreviewImage)
													]);

													$.append($$anchor, img_1);
												};

												var alternate_9 = ($$anchor) => {
													ImageIcon($$anchor, { class: 'text-muted-foreground h-8 w-8' });
												};

												$.if(node_84, ($$render) => {
													if ($.get(pageSettings).socialPagePreviewImage) $$render(consequent_15); else $$render(alternate_9, -1);
												});
											}

											$.reset(div_30);

											var div_31 = $.sibling(div_30, 2);
											var div_32 = $.child(div_31);
											var node_85 = $.child(div_32);

											Button(node_85, {
												variant: 'outline',
												size: 'sm',
												get disabled() {
													return $.get(uploadingSocialPreview);
												},
												onclick: () => document.getElementById("page-social-preview-input")?.click(),
												children: ($$anchor, $$slotProps) => {
													var fragment_56 = $.comment();
													var node_86 = $.first_child(fragment_56);

													{
														var consequent_16 = ($$anchor) => {
															var fragment_57 = root_7();
															var node_87 = $.first_child(fragment_57);

															Loader(node_87, { class: 'h-4 w-4 animate-spin' });
															$.next();
															$.append($$anchor, fragment_57);
														};

														var alternate_10 = ($$anchor) => {
															var fragment_58 = root_22();
															var node_88 = $.first_child(fragment_58);

															UploadIcon(node_88, { class: 'h-4 w-4' });
															$.next();
															$.append($$anchor, fragment_58);
														};

														$.if(node_86, ($$render) => {
															if ($.get(uploadingSocialPreview)) $$render(consequent_16); else $$render(alternate_10, -1);
														});
													}

													$.append($$anchor, fragment_56);
												},
												$$slots: { default: true }
											});

											var input_2 = $.sibling(node_85, 2);
											var node_89 = $.sibling(input_2, 2);

											{
												var consequent_17 = ($$anchor) => {
													Button($$anchor, {
														variant: 'ghost',
														size: 'sm',
														onclick: clearSocialPreview,
														children: ($$anchor, $$slotProps) => {
															XIcon($$anchor, { class: 'h-4 w-4' });
														},
														$$slots: { default: true }
													});
												};

												$.if(node_89, ($$render) => {
													if ($.get(pageSettings).socialPagePreviewImage) $$render(consequent_17);
												});
											}

											$.reset(div_32);

											var node_90 = $.sibling(div_32, 2);

											{
												var consequent_18 = ($$anchor) => {
													var p_4 = root_23();
													var text_34 = $.only_child(p_4, true);

													$.template_effect(() => $.set_text(text_34, $.get(pageSettings).socialPagePreviewImage));
													$.append($$anchor, p_4);
												};

												var alternate_11 = ($$anchor) => {
													var p_5 = root_24();

													$.append($$anchor, p_5);
												};

												$.if(node_90, ($$render) => {
													if ($.get(pageSettings).socialPagePreviewImage) $$render(consequent_18); else $$render(alternate_11, -1);
												});
											}

											$.reset(div_31);
											$.reset(div_29);

											var div_33 = $.sibling(div_29, 2);
											var node_91 = $.child(div_33);

											Label(node_91, {
												for: 'page-metaPageTitle',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_35 = $.text('Meta Title');

													$.append($$anchor, text_35);
												},
												$$slots: { default: true }
											});

											var node_92 = $.sibling(node_91, 2);

											Input(node_92, {
												id: 'page-metaPageTitle',
												type: 'text',
												placeholder: 'Custom page title for search engines',
												get value() {
													return $.get(pageSettings).metaPageTitle;
												},

												set value($$value) {
													$.get(pageSettings).metaPageTitle = $$value;
												}
											});

											$.next(2);
											$.reset(div_33);

											var div_34 = $.sibling(div_33, 2);
											var node_93 = $.child(div_34);

											Label(node_93, {
												for: 'page-metaPageDescription',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_36 = $.text('Meta Description');

													$.append($$anchor, text_36);
												},
												$$slots: { default: true }
											});

											var node_94 = $.sibling(node_93, 2);

											Textarea(node_94, {
												id: 'page-metaPageDescription',
												placeholder: 'Custom description for search engines',
												rows: 3,
												get value() {
													return $.get(pageSettings).metaPageDescription;
												},

												set value($$value) {
													$.get(pageSettings).metaPageDescription = $$value;
												}
											});

											$.next(2);
											$.reset(div_34);
											$.template_effect(() => input_2.disabled = $.get(uploadingSocialPreview));
											$.delegated('change', input_2, handleSocialPreviewUpload);
											$.append($$anchor, fragment_54);
										},
										$$slots: { default: true }
									});
								});

								var node_95 = $.sibling(node_83, 2);

								$.component(node_95, () => Card.Footer, ($$anchor, Card_Footer_2) => {
									Card_Footer_2($$anchor, {
										class: 'flex justify-end',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												onclick: () => savePageSettings("seo"),
												get disabled() {
													return $.get(savingSeoSettings);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_62 = $.comment();
													var node_96 = $.first_child(fragment_62);

													{
														var consequent_19 = ($$anchor) => {
															var fragment_63 = root_19();
															var node_97 = $.first_child(fragment_63);

															Loader(node_97, { class: 'h-4 w-4 animate-spin' });
															$.next();
															$.append($$anchor, fragment_63);
														};

														var alternate_12 = ($$anchor) => {
															var fragment_64 = root_26();
															var node_98 = $.first_child(fragment_64);

															SaveIcon(node_98, { class: 'h-4 w-4' });
															$.next();
															$.append($$anchor, fragment_64);
														};

														$.if(node_96, ($$render) => {
															if ($.get(savingSeoSettings)) $$render(consequent_19); else $$render(alternate_12, -1);
														});
													}

													$.append($$anchor, fragment_62);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_52);
							},
							$$slots: { default: true }
						});
					});

					var node_99 = $.sibling(node_79, 2);

					{
						var consequent_21 = ($$anchor) => {
							var fragment_65 = $.comment();
							var node_100 = $.first_child(fragment_65);

							$.component(node_100, () => Card.Root, ($$anchor, Card_Root_4) => {
								Card_Root_4($$anchor, {
									class: 'border-destructive',
									children: ($$anchor, $$slotProps) => {
										var fragment_66 = root_1();
										var node_101 = $.first_child(fragment_66);

										$.component(node_101, () => Card.Header, ($$anchor, Card_Header_4) => {
											Card_Header_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_67 = root_2();
													var node_102 = $.first_child(fragment_67);

													$.component(node_102, () => Card.Title, ($$anchor, Card_Title_4) => {
														Card_Title_4($$anchor, {
															class: 'text-destructive',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_37 = $.text('Danger Zone');

																$.append($$anchor, text_37);
															},
															$$slots: { default: true }
														});
													});

													var node_103 = $.sibling(node_102, 2);

													$.component(node_103, () => Card.Description, ($$anchor, Card_Description_4) => {
														Card_Description_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_38 = $.text('Irreversible actions for this page');

																$.append($$anchor, text_38);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_67);
												},
												$$slots: { default: true }
											});
										});

										var node_104 = $.sibling(node_101, 2);

										$.component(node_104, () => Card.Content, ($$anchor, Card_Content_4) => {
											Card_Content_4($$anchor, {
												class: 'space-y-4',
												children: ($$anchor, $$slotProps) => {
													var div_35 = root_27();
													var node_105 = $.child(div_35);

													Label(node_105, {
														for: 'delete-confirm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_39 = $.text('Delete Page');

															$.append($$anchor, text_39);
														},
														$$slots: { default: true }
													});

													var p_6 = $.sibling(node_105, 4);
													var code = $.sibling($.child(p_6));
													var text_40 = $.only_child(code);

													$.next();
													$.reset(p_6);

													var node_106 = $.sibling(p_6, 2);

													{
														let $0 = $.derived(() => $.get(currentPage).page_path || 'home');

														Input(node_106, {
															id: 'delete-confirm',
															type: 'text',
															get placeholder() {
																return `delete ${$.get($0) ?? ''}`;
															},

															get value() {
																return $.get(deleteConfirmText);
															},

															set value($$value) {
																$.set(deleteConfirmText, $$value, true);
															}
														});
													}

													$.reset(div_35);
													$.template_effect(() => $.set_text(text_40, `delete ${($.get(currentPage).page_path || "home") ?? ''}`));
													$.append($$anchor, div_35);
												},
												$$slots: { default: true }
											});
										});

										var node_107 = $.sibling(node_104, 2);

										$.component(node_107, () => Card.Footer, ($$anchor, Card_Footer_3) => {
											Card_Footer_3($$anchor, {
												class: 'flex justify-end',
												children: ($$anchor, $$slotProps) => {
													{
														let $0 = $.derived(() => !$.get(canDelete) || $.get(deleting));

														Button($$anchor, {
															variant: 'destructive',
															onclick: deletePage,
															get disabled() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_69 = $.comment();
																var node_108 = $.first_child(fragment_69);

																{
																	var consequent_20 = ($$anchor) => {
																		var fragment_70 = root_28();
																		var node_109 = $.first_child(fragment_70);

																		Loader(node_109, { class: 'h-4 w-4 animate-spin' });
																		$.next();
																		$.append($$anchor, fragment_70);
																	};

																	var alternate_13 = ($$anchor) => {
																		var fragment_71 = root_29();
																		var node_110 = $.first_child(fragment_71);

																		TrashIcon(node_110, { class: 'h-4 w-4' });
																		$.next();
																		$.append($$anchor, fragment_71);
																	};

																	$.if(node_108, ($$render) => {
																		if ($.get(deleting)) $$render(consequent_20); else $$render(alternate_13, -1);
																	});
																}

																$.append($$anchor, fragment_69);
															},
															$$slots: { default: true }
														});
													}
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_66);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_65);
						};

						$.if(node_99, ($$render) => {
							if ($.get(currentPage).page_path !== "") $$render(consequent_21);
						});
					}

					$.append($$anchor, fragment_24);
				};

				$.if(node_34, ($$render) => {
					if (!$.get(isNew) && $.get(currentPage)) $$render(consequent_22);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate_14, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);