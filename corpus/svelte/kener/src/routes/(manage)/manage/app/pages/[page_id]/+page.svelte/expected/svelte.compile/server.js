import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		const isNew = $.derived(() => pageId() === "new");

		// State
		let loading = true;

		let saving = false;
		let savingMonitors = false;
		let uploadingLogo = false;
		let uploadingSocialPreview = false;

		// Page data
		let currentPage = null;

		let monitors = [];

		// Form state
		let formData = {
			page_path: "",
			page_title: "",
			page_header: "",
			page_subheader: "",
			page_logo: ""
		};

		// Monitor selection
		let selectedMonitorTag = "";

		let selectedMonitors = [];
		let addingMonitor = false;
		let removingMonitor = null;
		let reordering = false;

		// Delete state
		let deleteConfirmText = "";

		let deleting = false;
		const canDelete = $.derived(() => !isNew() && currentPage && currentPage.page_path !== "" && deleteConfirmText === `delete ${currentPage?.page_path || "home"}`);

		// Page settings state
		let pageSettings = structuredClone(defaultPageSettings);

		const isHistoryDesktopValid = $.derived(() => Number.isInteger(pageSettings.monitor_status_history_days.desktop) && pageSettings.monitor_status_history_days.desktop >= GC.STATUS_HISTORY_DAYS_MIN && pageSettings.monitor_status_history_days.desktop <= GC.STATUS_HISTORY_DAYS_MAX);
		const isHistoryMobileValid = $.derived(() => Number.isInteger(pageSettings.monitor_status_history_days.mobile) && pageSettings.monitor_status_history_days.mobile >= GC.STATUS_HISTORY_DAYS_MIN && pageSettings.monitor_status_history_days.mobile <= GC.STATUS_HISTORY_DAYS_MAX);
		let savingDisplaySettings = false;
		let savingSeoSettings = false;

		// Validation
		const isFormValid = $.derived(() => formData.page_title.trim().length > 0 && formData.page_header.trim().length > 0);

		async function fetchPage() {
			if (isNew()) {
				loading = false;

				return;
			}

			loading = true;

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

				const foundPage = result.find((p) => p.id === parseInt(pageId() || "0"));

				if (foundPage) {
					currentPage = foundPage;

					formData = {
						page_path: foundPage.page_path,
						page_title: foundPage.page_title,
						page_header: foundPage.page_header,
						page_subheader: foundPage.page_subheader || "",
						page_logo: foundPage.page_logo || ""
					};

					selectedMonitors = foundPage.monitors?.map((m) => m.monitor_tag) || [];

					// Load page settings with defaults
					if (foundPage.page_settings_json) {
						try {
							const parsed = typeof foundPage.page_settings_json === "string"
								? JSON.parse(foundPage.page_settings_json)
								: foundPage.page_settings_json;

							pageSettings = { ...structuredClone(defaultPageSettings), ...parsed };
						} catch {
							pageSettings = structuredClone(defaultPageSettings);
						}
					} else {
						pageSettings = structuredClone(defaultPageSettings);
					}
				} else {
					toast.error("Page not found");
					goto(clientResolver(resolve, "/manage/app/pages"));
				}
			} catch(e) {
				toast.error("Failed to load page");
				goto(clientResolver(resolve, "/manage/app/pages"));
			} finally {
				loading = false;
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
					monitors = result;
				}
			} catch(e) {
				console.error("Failed to fetch monitors", e);
			}
		}

		async function savePage() {
			if (!isFormValid()) return;

			saving = true;

			try {
				const action = isNew() ? "createPage" : "updatePage";

				// Make page_path URL-friendly: lowercase, replace spaces with hyphens, remove special chars
				const sanitizedPath = formData.page_path.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");

				const data = {
					page_path: sanitizedPath,
					page_title: formData.page_title,
					page_header: formData.page_header,
					page_subheader: formData.page_subheader || null,
					page_logo: formData.page_logo || null
				};

				if (!isNew() && currentPage) {
					data.id = currentPage.id;
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
					toast.success(isNew()
						? "Page created successfully"
						: "Page updated successfully");

					if (isNew() && result.id) {
						// Navigate to the newly created page
						goto(clientResolver(resolve, `/manage/app/pages/${result.id}`));
					} else if (isNew()) {
						// Fallback: go back to pages list
						goto(clientResolver(resolve, "/manage/app/pages"));
					}
				}
			} catch(e) {
				toast.error(isNew() ? "Failed to create page" : "Failed to update page");
			} finally {
				saving = false;
			}
		}

		async function addMonitorToPage() {
			if (!currentPage || !selectedMonitorTag) return;

			addingMonitor = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "addMonitorToPage",
						data: { page_id: currentPage.id, monitor_tag: selectedMonitorTag }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Monitor added to page");
					selectedMonitors = [...selectedMonitors, selectedMonitorTag];
					selectedMonitorTag = "";
				}
			} catch(e) {
				toast.error("Failed to add monitor");
			} finally {
				addingMonitor = false;
			}
		}

		async function deletePage() {
			if (!currentPage || !canDelete()) return;

			deleting = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "deletePage", data: { id: currentPage.id } })
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
				deleting = false;
			}
		}

		async function removeMonitorFromPage(monitorTag) {
			if (!currentPage) return;

			removingMonitor = monitorTag;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "removeMonitorFromPage",
						data: { page_id: currentPage.id, monitor_tag: monitorTag }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Monitor removed from page");
					selectedMonitors = selectedMonitors.filter((t) => t !== monitorTag);
				}
			} catch(e) {
				toast.error("Failed to remove monitor");
			} finally {
				removingMonitor = null;
			}
		}

		// Get available monitors (not already on the current page)
		const availableMonitors = $.derived(() => monitors.filter((m) => !selectedMonitors.includes(m.tag)));

		async function moveMonitor(index, direction) {
			const newIndex = direction === "up" ? index - 1 : index + 1;

			if (newIndex < 0 || newIndex >= selectedMonitors.length) return;

			const updated = [...selectedMonitors];

			[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
			selectedMonitors = updated;

			if (!currentPage) return;

			reordering = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "reorderPageMonitors",
						data: { page_id: currentPage.id, monitor_tags: selectedMonitors }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				}
			} catch(e) {
				toast.error("Failed to reorder monitors");
			} finally {
				reordering = false;
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

			uploadingLogo = true;

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
					formData.page_logo = result.url;
					toast.success("Logo uploaded successfully");
				}
			} catch(e) {
				toast.error("Failed to upload logo");
			} finally {
				uploadingLogo = false;
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
			formData.page_logo = "";
		}

		function clearSocialPreview() {
			pageSettings.socialPagePreviewImage = "";
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

			uploadingSocialPreview = true;

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
					pageSettings.socialPagePreviewImage = result.url;
					toast.success("Social preview image uploaded");
				}
			} catch(e) {
				toast.error("Failed to upload social preview image");
			} finally {
				uploadingSocialPreview = false;
				input.value = "";
			}
		}

		async function savePageSettings(source) {
			if (!currentPage) return;

			if (source === "display" && (!isHistoryDesktopValid() || !isHistoryMobileValid())) {
				toast.error(`Days must be a whole number between ${GC.STATUS_HISTORY_DAYS_MIN} and ${GC.STATUS_HISTORY_DAYS_MAX}`);

				return;
			}

			if (source === "display") savingDisplaySettings = true; else savingSeoSettings = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updatePage",
						data: {
							id: currentPage.id,
							page_settings_json: JSON.stringify(pageSettings)
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
				if (source === "display") savingDisplaySettings = false; else savingSeoSettings = false;
			}
		}

		onMount(() => {
			void fetchPage();
			void fetchMonitors();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container space-y-6 py-6">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
				Spinner($$renderer, { class: 'size-8' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="flex items-center justify-between">`);

				if (Breadcrumb.Root) {
					$$renderer.push('<!--[-->');

					Breadcrumb.Root($$renderer, {
						children: ($$renderer) => {
							if (Breadcrumb.List) {
								$$renderer.push('<!--[-->');

								Breadcrumb.List($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Item) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Item($$renderer, {
												children: ($$renderer) => {
													if (Breadcrumb.Link) {
														$$renderer.push('<!--[-->');

														Breadcrumb.Link($$renderer, {
															href: clientResolver(resolve, "/manage/app/pages"),
															children: ($$renderer) => {
																$$renderer.push(`<!---->Pages`);
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

										if (Breadcrumb.Separator) {
											$$renderer.push('<!--[-->');
											Breadcrumb.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Breadcrumb.Item) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Item($$renderer, {
												children: ($$renderer) => {
													if (Breadcrumb.Page) {
														$$renderer.push('<!--[-->');

														Breadcrumb.Page($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(isNew() ? "New Page" : currentPage?.page_title || "Edit Page")}`);
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

				$$renderer.push(` <div>`);

				if (!isNew()) {
					$$renderer.push('<!--[0-->');

					Button($$renderer, {
						variant: 'outline',
						target: '_blank',
						size: 'sm',
						href: clientResolver(resolve, `/${currentPage?.page_path}`),
						children: ($$renderer) => {
							$$renderer.push(`<!---->View`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> `);

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
													$$renderer.push(`<!---->General Information`);
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
													$$renderer.push(`<!---->${$.escape(isNew() ? "Create a new status page" : "Update page settings")}`);
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
										$$renderer.push(`<div class="space-y-2">`);

										Label($$renderer, {
											for: 'page-path',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Path <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'page-path',
											type: 'text',
											disabled: !isNew() && currentPage?.page_path === "",
											get value() {
												return formData.page_path;
											},

											set value($$value) {
												formData.page_path = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">${$.escape(!isNew() && currentPage?.page_path === ""
											? "Home page path cannot be changed"
											: "URL path for the page (e.g., services, infrastructure). Will be made URL-friendly.")}</p></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'page-title',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Title <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'page-title',
											type: 'text',
											placeholder: 'Services Status',
											get value() {
												return formData.page_title;
											},

											set value($$value) {
												formData.page_title = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Page title shown in browser tab</p></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'page-header',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Header <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'page-header',
											type: 'text',
											placeholder: 'Services Status',
											get value() {
												return formData.page_header;
											},

											set value($$value) {
												formData.page_header = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Main heading displayed on the page</p></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'page-subheader',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Page Content`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="overflow-hidden rounded-md border">`);

										CodeMirror($$renderer, {
											lang: markdown(),
											theme: mode.current === "dark" ? githubDark : githubLight,
											styles: { "&": { width: "100%", maxWidth: "100%", height: "160px" } },
											get value() {
												return formData.page_subheader;
											},

											set value($$value) {
												formData.page_subheader = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <p class="text-muted-foreground text-xs">Supports Markdown. Optional content below the header.</p></div> <div class="space-y-2">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Page Logo`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="flex items-start gap-4"><div class="bg-muted flex h-16 w-16 items-center justify-center rounded-lg border">`);

										if (formData.page_logo) {
											$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, formData.page_logo))} alt="Logo" class="max-h-14 max-w-14 object-contain"/>`);
										} else {
											$$renderer.push('<!--[-1-->');
											ImageIcon($$renderer, { class: 'text-muted-foreground h-6 w-6' });
										}

										$$renderer.push(`<!--]--></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2">`);

										Button($$renderer, {
											variant: 'outline',
											size: 'sm',
											disabled: uploadingLogo,
											onclick: () => document.getElementById("page-logo-input")?.click(),
											children: ($$renderer) => {
												if (uploadingLogo) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> Uploading...`);
												} else {
													$$renderer.push('<!--[-1-->');
													UploadIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> Upload`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <input id="page-logo-input" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/heic,image/heif" class="hidden"${$.attr('disabled', uploadingLogo, true)}/> `);

										if (formData.page_logo) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												variant: 'ghost',
												size: 'sm',
												onclick: clearLogo,
												children: ($$renderer) => {
													XIcon($$renderer, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> <p class="text-muted-foreground text-xs">Optional logo for this page (max 256x256px)</p></div></div></div>`);
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
											onclick: savePage,
											disabled: saving || !isFormValid(),
											children: ($$renderer) => {
												if (saving) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> ${$.escape(isNew() ? "Creating..." : "Saving...")}`);
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> ${$.escape(isNew() ? "Create Page" : "Save Changes")}`);
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

				if (!isNew() && currentPage) {
					$$renderer.push('<!--[0-->');

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
														$$renderer.push(`<!---->Page Monitors`);
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
														$$renderer.push(`<!---->Select which monitors to display on this page`);
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
											$$renderer.push(`<div class="flex gap-2">`);

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													get value() {
														return selectedMonitorTag;
													},

													set value($$value) {
														selectedMonitorTag = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																class: 'flex-1',
																children: ($$renderer) => {
																	if (selectedMonitorTag) {
																		$$renderer.push(`<!--[0-->${$.escape(monitors.find((m) => m.tag === selectedMonitorTag)?.name || selectedMonitorTag)}`);
																	} else {
																		$$renderer.push(`<!--[-1-->Select a monitor to add`);
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

														if (Select.Content) {
															$$renderer.push('<!--[-->');

															Select.Content($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array = $.ensure_array_like(availableMonitors());

																	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																		let monitor = each_array[$$index];

																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: monitor.tag,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(monitor.name)} (${$.escape(monitor.tag)})`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(`<!--]--> `);

																	if (availableMonitors().length === 0) {
																		$$renderer.push(`<!--[0--><div class="text-muted-foreground px-2 py-1 text-sm">No available monitors</div>`);
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
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											Button($$renderer, {
												onclick: addMonitorToPage,
												disabled: addingMonitor || !selectedMonitorTag,
												children: ($$renderer) => {
													if (addingMonitor) {
														$$renderer.push('<!--[0-->');
														Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													} else {
														$$renderer.push('<!--[-1-->');
														PlusIcon($$renderer, { class: 'h-4 w-4' });
														$$renderer.push(`<!----> Add`);
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div> <div class="space-y-2">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Current Monitors`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (selectedMonitors.length > 0) {
												$$renderer.push(`<!--[0--><div class="space-y-2"><!--[-->`);

												const each_array_1 = $.ensure_array_like(selectedMonitors);

												for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
													let monitorTag = each_array_1[i];
													const monitor = monitors.find((m) => m.tag === monitorTag);

													$$renderer.push(`<div class="bg-muted flex items-center justify-between rounded-lg p-3"><div><p class="font-medium">${$.escape(monitor?.name || monitorTag)}</p> <p class="text-muted-foreground text-xs">${$.escape(monitorTag)}</p></div> <div class="flex items-center gap-1">`);

													Button($$renderer, {
														variant: 'ghost',
														size: 'sm',
														onclick: () => moveMonitor(i, "up"),
														disabled: i === 0 || reordering,
														children: ($$renderer) => {
															ArrowUpIcon($$renderer, { class: 'h-4 w-4' });
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'ghost',
														size: 'sm',
														onclick: () => moveMonitor(i, "down"),
														disabled: i === selectedMonitors.length - 1 || reordering,
														children: ($$renderer) => {
															ArrowDownIcon($$renderer, { class: 'h-4 w-4' });
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'ghost',
														size: 'sm',
														onclick: () => removeMonitorFromPage(monitorTag),
														disabled: removingMonitor === monitorTag,
														children: ($$renderer) => {
															if (removingMonitor === monitorTag) {
																$$renderer.push('<!--[0-->');
																Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
															} else {
																$$renderer.push('<!--[-1-->');
																XIcon($$renderer, { class: 'h-4 w-4' });
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div></div>`);
												}

												$$renderer.push(`<!--]--></div>`);
											} else {
												$$renderer.push(`<!--[-1--><div class="text-muted-foreground bg-muted rounded-lg p-4 text-center text-sm">No monitors added to this page yet</div>`);
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
														$$renderer.push(`<!---->Display Settings`);
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
														$$renderer.push(`<!---->Configure what content is shown on this status page`);
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
											$$renderer.push(`<div class="space-y-4"><div>`);

											Label($$renderer, {
												class: 'text-base font-medium',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Monitor Status History`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Configure how many days of status history to display on the status page</p></div> <div class="grid grid-cols-2 gap-4"><div class="space-y-2">`);

											Label($$renderer, {
												for: 'history-desktop',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Desktop (days)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'history-desktop',
												type: 'number',
												step: '1',
												min: GC.STATUS_HISTORY_DAYS_MIN,
												max: GC.STATUS_HISTORY_DAYS_MAX,
												class: isHistoryDesktopValid() ? "" : "border-destructive",
												get value() {
													return pageSettings.monitor_status_history_days.desktop;
												},

												set value($$value) {
													pageSettings.monitor_status_history_days.desktop = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Number of days shown on desktop screens</p></div> <div class="space-y-2">`);

											Label($$renderer, {
												for: 'history-mobile',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Mobile (days)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'history-mobile',
												type: 'number',
												step: '1',
												min: GC.STATUS_HISTORY_DAYS_MIN,
												max: GC.STATUS_HISTORY_DAYS_MAX,
												class: isHistoryMobileValid() ? "" : "border-destructive",
												get value() {
													return pageSettings.monitor_status_history_days.mobile;
												},

												set value($$value) {
													pageSettings.monitor_status_history_days.mobile = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Number of days shown on mobile screens</p></div></div></div> <hr class="border-muted"/> <div class="space-y-4"><div>`);

											Label($$renderer, {
												class: 'text-base font-medium',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Monitor Layout Style`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Choose how monitors are displayed on the status page</p></div> `);

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													get value() {
														return pageSettings.monitor_layout_style;
													},

													set value($$value) {
														pageSettings.monitor_layout_style = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																class: 'w-full',
																children: ($$renderer) => {
																	if (pageSettings.monitor_layout_style === "default-list") {
																		$$renderer.push(`<!--[0-->Default List`);
																	} else if (pageSettings.monitor_layout_style === "default-grid") {
																		$$renderer.push(`<!--[1-->Default Grid`);
																	} else if (pageSettings.monitor_layout_style === "compact-list") {
																		$$renderer.push(`<!--[2-->Compact List`);
																	} else {
																		$$renderer.push(`<!--[-1-->Compact Grid`);
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

														if (Select.Content) {
															$$renderer.push('<!--[-->');

															Select.Content($$renderer, {
																children: ($$renderer) => {
																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: 'default-list',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Default List`);
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
																			value: 'default-grid',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Default Grid`);
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
																			value: 'compact-list',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Compact List`);
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
																			value: 'compact-grid',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Compact Grid`);
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

											$$renderer.push(` <p class="text-muted-foreground text-xs">Default is <code class="bg-muted rounded px-1 font-mono">default-list</code></p></div>`);
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
												onclick: () => savePageSettings("display"),
												disabled: savingDisplaySettings,
												children: ($$renderer) => {
													if (savingDisplaySettings) {
														$$renderer.push('<!--[0-->');
														Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
														$$renderer.push(`<!----> Saving...`);
													} else {
														$$renderer.push('<!--[-1-->');
														SaveIcon($$renderer, { class: 'h-4 w-4' });
														$$renderer.push(`<!----> Save Preferences`);
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
														$$renderer.push(`<!---->Optional social preview image and meta tags for this page. Leave empty to use site defaults.`);
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

											if (pageSettings.socialPagePreviewImage) {
												$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, pageSettings.socialPagePreviewImage))} alt="Social preview" class="h-full w-full rounded-lg object-cover"/>`);
											} else {
												$$renderer.push('<!--[-1-->');
												ImageIcon($$renderer, { class: 'text-muted-foreground h-8 w-8' });
											}

											$$renderer.push(`<!--]--></div> <div class="flex flex-1 flex-col gap-2"><div class="flex gap-2">`);

											Button($$renderer, {
												variant: 'outline',
												size: 'sm',
												disabled: uploadingSocialPreview,
												onclick: () => document.getElementById("page-social-preview-input")?.click(),
												children: ($$renderer) => {
													if (uploadingSocialPreview) {
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

											$$renderer.push(`<!----> <input id="page-social-preview-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" class="hidden"${$.attr('disabled', uploadingSocialPreview, true)}/> `);

											if (pageSettings.socialPagePreviewImage) {
												$$renderer.push('<!--[0-->');

												Button($$renderer, {
													variant: 'ghost',
													size: 'sm',
													onclick: clearSocialPreview,
													children: ($$renderer) => {
														XIcon($$renderer, { class: 'h-4 w-4' });
													},
													$$slots: { default: true }
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div> `);

											if (pageSettings.socialPagePreviewImage) {
												$$renderer.push(`<!--[0--><p class="text-muted-foreground truncate text-xs">${$.escape(pageSettings.socialPagePreviewImage)}</p>`);
											} else {
												$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-xs">Optional. Leave empty to use site default.</p>`);
											}

											$$renderer.push(`<!--]--></div></div> <div class="space-y-2">`);

											Label($$renderer, {
												for: 'page-metaPageTitle',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Meta Title`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'page-metaPageTitle',
												type: 'text',
												placeholder: 'Custom page title for search engines',
												get value() {
													return pageSettings.metaPageTitle;
												},

												set value($$value) {
													pageSettings.metaPageTitle = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Overrides the default page title in search results</p></div> <div class="space-y-2">`);

											Label($$renderer, {
												for: 'page-metaPageDescription',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Meta Description`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Textarea($$renderer, {
												id: 'page-metaPageDescription',
												placeholder: 'Custom description for search engines',
												rows: 3,
												get value() {
													return pageSettings.metaPageDescription;
												},

												set value($$value) {
													pageSettings.metaPageDescription = $$value;
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
												onclick: () => savePageSettings("seo"),
												disabled: savingSeoSettings,
												children: ($$renderer) => {
													if (savingSeoSettings) {
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

					if (currentPage.page_path !== "") {
						$$renderer.push('<!--[0-->');

						if (Card.Root) {
							$$renderer.push('<!--[-->');

							Card.Root($$renderer, {
								class: 'border-destructive',
								children: ($$renderer) => {
									if (Card.Header) {
										$$renderer.push('<!--[-->');

										Card.Header($$renderer, {
											children: ($$renderer) => {
												if (Card.Title) {
													$$renderer.push('<!--[-->');

													Card.Title($$renderer, {
														class: 'text-destructive',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Danger Zone`);
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
															$$renderer.push(`<!---->Irreversible actions for this page`);
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
												$$renderer.push(`<div class="space-y-2">`);

												Label($$renderer, {
													for: 'delete-confirm',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Delete Page`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Once you delete a page, there is no going back. Please be certain.</p> <p class="text-muted-foreground text-sm">Type <code class="bg-muted rounded px-1 font-mono">delete ${$.escape(currentPage.page_path || "home")}</code> to confirm:</p> `);

												Input($$renderer, {
													id: 'delete-confirm',
													type: 'text',
													placeholder: `delete ${$.stringify(currentPage.page_path || 'home')}`,
													get value() {
														return deleteConfirmText;
													},

													set value($$value) {
														deleteConfirmText = $$value;
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
													variant: 'destructive',
													onclick: deletePage,
													disabled: !canDelete() || deleting,
													children: ($$renderer) => {
														if (deleting) {
															$$renderer.push('<!--[0-->');
															Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
															$$renderer.push(`<!----> Deleting...`);
														} else {
															$$renderer.push('<!--[-1-->');
															TrashIcon($$renderer, { class: 'h-4 w-4' });
															$$renderer.push(`<!----> Delete Page`);
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
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
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