import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import UploadIcon from "@lucide/svelte/icons/upload";
import XIcon from "@lucide/svelte/icons/x";
import ImageIcon from "@lucide/svelte/icons/image";
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import GC from "$lib/global-constants.js";

export default function GeneralSettingsCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitor = void 0, typeData, isNew } = $$props;
		let savingGeneral = false;
		let uploadingImage = false;

		async function handleImageUpload(event) {
			const input = event.target;
			const file = input.files?.[0];

			if (!file) return;

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

			if (file.size > GC.MAX_UPLOAD_BYTES) {
				toast.error(`File too large. Maximum size is ${GC.MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);

				return;
			}

			uploadingImage = true;

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
							maxWidth: 128,
							maxHeight: 128,
							prefix: "monitor_"
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					monitor.image = result.url;
					toast.success("Image uploaded successfully");
				}
			} catch(e) {
				toast.error("Failed to upload image");
			} finally {
				uploadingImage = false;
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

		function clearImage() {
			monitor.image = "";
		}

		async function saveGeneralSettings() {
			savingGeneral = true;

			try {
				const payload = { ...monitor, type_data: JSON.stringify(typeData) };

				// Include default uptime settings when creating a new monitor
				if (isNew) {
					payload.monitor_settings_json = JSON.stringify({
						uptime_formula_numerator: "up + maintenance",
						uptime_formula_denominator: "up + maintenance + down + degraded"
					});
				}

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "storeMonitorData", data: payload })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else if (isNew) {
					toast.success("Monitor created successfully");
					goto(clientResolver(resolve, `/manage/app/monitors/${monitor.tag}`));
				} else {
					toast.success("General settings saved successfully");
				}
			} catch(e) {
				const message = e instanceof Error ? e.message : "Failed to save general settings";

				toast.error(message);
			} finally {
				savingGeneral = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
												$$renderer.push(`<!---->General Settings`);
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
												$$renderer.push(`<!---->Basic information about this monitor`);
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
									$$renderer.push(`<div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Name <span class="text-destructive">*</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'monitor-name',
										placeholder: 'My API Monitor',
										get value() {
											return monitor.name;
										},

										set value($$value) {
											monitor.name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-tag',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Tag <span class="text-destructive">*</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'monitor-tag',
										placeholder: 'my-api-monitor',
										disabled: !isNew,
										get value() {
											return monitor.tag;
										},

										set value($$value) {
											monitor.tag = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground mt-1 text-xs">Unique identifier (cannot be changed after creation)</p></div></div> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-description',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Description`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Textarea($$renderer, {
										id: 'monitor-description',
										placeholder: 'A brief description of what this monitor checks',
										rows: 3,
										get value() {
											return monitor.description;
										},

										set value($$value) {
											monitor.description = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-external_url',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Service URL`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'monitor-external_url',
										placeholder: 'https://example.com/api/health',
										get value() {
											return monitor.external_url;
										},

										set value($$value) {
											monitor.external_url = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Monitor Image`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex items-center gap-3"><div class="bg-muted flex h-12 w-12 items-center justify-center rounded-md border">`);

									if (monitor.image) {
										$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, monitor.image))} alt="Monitor" class="max-h-10 max-w-10 object-contain"/>`);
									} else {
										$$renderer.push('<!--[-1-->');
										ImageIcon($$renderer, { class: 'text-muted-foreground h-5 w-5' });
									}

									$$renderer.push(`<!--]--></div> <div class="flex gap-2">`);

									Button($$renderer, {
										variant: 'outline',
										size: 'sm',
										disabled: uploadingImage,
										onclick: () => document.getElementById("monitor-image-input")?.click(),
										children: ($$renderer) => {
											if (uploadingImage) {
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

									$$renderer.push(`<!----> <input id="monitor-image-input" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/heic,image/heif" class="hidden"${$.attr('disabled', uploadingImage, true)}/> `);

									if (monitor.image) {
										$$renderer.push('<!--[0-->');

										Button($$renderer, {
											variant: 'ghost',
											size: 'icon',
											onclick: clearImage,
											children: ($$renderer) => {
												XIcon($$renderer, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div></div> <p class="text-muted-foreground text-xs">Max 128x128px, PNG/JPG/SVG/WebP</p></div> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-cron',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Cron Schedule`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'monitor-cron',
										placeholder: '* * * * *',
										get value() {
											return monitor.cron;
										},

										set value($$value) {
											monitor.cron = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground mt-1 text-xs">How often to check (cron format)</p></div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-default-status',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Default Status`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											value: monitor.default_status,
											onValueChange: (v) => {
												if (v) monitor.default_status = v;
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														id: 'monitor-default-status',
														class: 'w-full',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(monitor.default_status)}`);
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
																	value: 'UP',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->UP`);
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
																	value: 'DOWN',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->DOWN`);
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
																	value: 'DEGRADED',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->DEGRADED`);
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
																	value: 'MAINTENANCE',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->MAINTENANCE`);
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

									$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'hidden-switch',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Hidden in Status Page`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex items-center gap-2">`);

									Switch($$renderer, {
										id: 'hidden-switch',
										checked: monitor.is_hidden === "YES",
										onCheckedChange: (checked) => monitor.is_hidden = checked ? "YES" : "NO"
									});

									$$renderer.push(`<!----> <span class="text-muted-foreground text-xs">${$.escape(monitor.is_hidden === "YES" ? "Hidden" : "Visible")}</span></div> <p class="text-muted-foreground text-xs">Hidden monitors won't appear on any status pages, but monitoring, alerting, and all other features will
          continue to work normally.</p></div> <div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-confirmation-threshold',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Grace period`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'monitor-confirmation-threshold',
										type: 'number',
										min: '1',
										max: '60',
										step: '1',
										value: monitor.confirmation_threshold ?? 1,
										oninput: (e) => {
											const v = parseInt(e.currentTarget.value, 10);

											monitor.confirmation_threshold = Number.isNaN(v) ? 1 : Math.min(60, Math.max(1, v));
										}
									});

									$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Require this many consecutive checks before a status change is recorded. 1 = off (record every check immediately).</p></div></div>`);
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
										onclick: saveGeneralSettings,
										disabled: savingGeneral,
										children: ($$renderer) => {
											if (savingGeneral) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'size-4' });
											}

											$$renderer.push(`<!--]--> ${$.escape(isNew ? "Create Monitor" : "Save General Settings")}`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { monitor });
	});
}