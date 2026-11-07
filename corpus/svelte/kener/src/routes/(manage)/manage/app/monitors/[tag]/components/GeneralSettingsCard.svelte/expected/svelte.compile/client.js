import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`Name <span class="text-destructive">*</span>`, 1);
var root_2 = $.from_html(`Tag <span class="text-destructive">*</span>`, 1);
var root_3 = $.from_html(`<img alt="Monitor" class="max-h-10 max-w-10 object-contain"/>`);
var root_4 = $.from_html(`<!> Uploading...`, 1);
var root_5 = $.from_html(`<!> Upload`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);

var root_7 = $.from_html(
	`<div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground mt-1 text-xs">Unique identifier (cannot be changed after creation)</p></div></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <div class="flex items-center gap-3"><div class="bg-muted flex h-12 w-12 items-center justify-center rounded-md border"><!></div> <div class="flex gap-2"><!> <input id="monitor-image-input" type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/heic,image/heif" class="hidden"/> <!></div></div> <p class="text-muted-foreground text-xs">Max 128x128px, PNG/JPG/SVG/WebP</p></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground mt-1 text-xs">How often to check (cron format)</p></div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <div class="flex items-center gap-2"><!> <span class="text-muted-foreground text-xs"> </span></div> <p class="text-muted-foreground text-xs">Hidden monitors won't appear on any status pages, but monitoring, alerting, and all other features will
          continue to work normally.</p></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">Require this many consecutive checks before a status change is recorded. 1 = off (record every check immediately).</p></div></div>`,
	1
);

var root_8 = $.from_html(`<!> `, 1);
var root_9 = $.from_html(`<!> <!> <!>`, 1);

export default function GeneralSettingsCard($$anchor, $$props) {
	$.push($$props, true);

	let monitor = $.prop($$props, 'monitor', 15);
	let savingGeneral = $.state(false);
	let uploadingImage = $.state(false);

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

		$.set(uploadingImage, true);

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
				monitor(monitor().image = result.url, true);
				toast.success("Image uploaded successfully");
			}
		} catch(e) {
			toast.error("Failed to upload image");
		} finally {
			$.set(uploadingImage, false);
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
		monitor(monitor().image = "", true);
	}

	async function saveGeneralSettings() {
		$.set(savingGeneral, true);

		try {
			const payload = { ...monitor(), type_data: JSON.stringify($$props.typeData) };

			// Include default uptime settings when creating a new monitor
			if ($$props.isNew) {
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
			} else if ($$props.isNew) {
				toast.success("Monitor created successfully");
				goto(clientResolver(resolve, `/manage/app/monitors/${monitor().tag}`));
			} else {
				toast.success("General settings saved successfully");
			}
		} catch(e) {
			const message = e instanceof Error ? e.message : "Failed to save general settings";

			toast.error(message);
		} finally {
			$.set(savingGeneral, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_9();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('General Settings');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Basic information about this monitor');

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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'space-y-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_7();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							var node_5 = $.child(div_1);

							Label(node_5, {
								for: 'monitor-name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_4 = root_1();

									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Input(node_6, {
								id: 'monitor-name',
								placeholder: 'My API Monitor',
								get value() {
									return monitor().name;
								},

								set value($$value) {
									monitor(monitor().name = $$value, true);
								}
							});

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_7 = $.child(div_2);

							Label(node_7, {
								for: 'monitor-tag',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_5 = root_2();

									$.next();
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							{
								let $0 = $.derived(() => !$$props.isNew);

								Input(node_8, {
									id: 'monitor-tag',
									placeholder: 'my-api-monitor',
									get disabled() {
										return $.get($0);
									},

									get value() {
										return monitor().tag;
									},

									set value($$value) {
										monitor(monitor().tag = $$value, true);
									}
								});
							}

							$.next(2);
							$.reset(div_2);
							$.reset(div);

							var div_3 = $.sibling(div, 2);
							var node_9 = $.child(div_3);

							Label(node_9, {
								for: 'monitor-description',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Description');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							Textarea(node_10, {
								id: 'monitor-description',
								placeholder: 'A brief description of what this monitor checks',
								rows: 3,
								get value() {
									return monitor().description;
								},

								set value($$value) {
									monitor(monitor().description = $$value, true);
								}
							});

							$.reset(div_3);

							var div_4 = $.sibling(div_3, 2);
							var node_11 = $.child(div_4);

							Label(node_11, {
								for: 'monitor-external_url',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Service URL');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							Input(node_12, {
								id: 'monitor-external_url',
								placeholder: 'https://example.com/api/health',
								get value() {
									return monitor().external_url;
								},

								set value($$value) {
									monitor(monitor().external_url = $$value, true);
								}
							});

							$.reset(div_4);

							var div_5 = $.sibling(div_4, 2);
							var div_6 = $.child(div_5);
							var node_13 = $.child(div_6);

							Label(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Monitor Image');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var div_7 = $.sibling(node_13, 2);
							var div_8 = $.child(div_7);
							var node_14 = $.child(div_8);

							{
								var consequent = ($$anchor) => {
									var img = root_3();

									$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => clientResolver(resolve, monitor().image)]);
									$.append($$anchor, img);
								};

								var alternate = ($$anchor) => {
									ImageIcon($$anchor, { class: 'text-muted-foreground h-5 w-5' });
								};

								$.if(node_14, ($$render) => {
									if (monitor().image) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div_8);

							var div_9 = $.sibling(div_8, 2);
							var node_15 = $.child(div_9);

							Button(node_15, {
								variant: 'outline',
								size: 'sm',
								get disabled() {
									return $.get(uploadingImage);
								},
								onclick: () => document.getElementById("monitor-image-input")?.click(),
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_16 = $.first_child(fragment_7);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_8 = root_4();
											var node_17 = $.first_child(fragment_8);

											Loader(node_17, { class: 'h-4 w-4 animate-spin' });
											$.next();
											$.append($$anchor, fragment_8);
										};

										var alternate_1 = ($$anchor) => {
											var fragment_9 = root_5();
											var node_18 = $.first_child(fragment_9);

											UploadIcon(node_18, { class: 'h-4 w-4' });
											$.next();
											$.append($$anchor, fragment_9);
										};

										$.if(node_16, ($$render) => {
											if ($.get(uploadingImage)) $$render(consequent_1); else $$render(alternate_1, -1);
										});
									}

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var input_1 = $.sibling(node_15, 2);
							var node_19 = $.sibling(input_1, 2);

							{
								var consequent_2 = ($$anchor) => {
									Button($$anchor, {
										variant: 'ghost',
										size: 'icon',
										onclick: clearImage,
										children: ($$anchor, $$slotProps) => {
											XIcon($$anchor, { class: 'h-4 w-4' });
										},
										$$slots: { default: true }
									});
								};

								$.if(node_19, ($$render) => {
									if (monitor().image) $$render(consequent_2);
								});
							}

							$.reset(div_9);
							$.reset(div_7);
							$.next(2);
							$.reset(div_6);

							var div_10 = $.sibling(div_6, 2);
							var node_20 = $.child(div_10);

							Label(node_20, {
								for: 'monitor-cron',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Cron Schedule');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_20, 2);

							Input(node_21, {
								id: 'monitor-cron',
								placeholder: '* * * * *',
								get value() {
									return monitor().cron;
								},

								set value($$value) {
									monitor(monitor().cron = $$value, true);
								}
							});

							$.next(2);
							$.reset(div_10);
							$.reset(div_5);

							var div_11 = $.sibling(div_5, 2);
							var div_12 = $.child(div_11);
							var node_22 = $.child(div_12);

							Label(node_22, {
								for: 'monitor-default-status',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Default Status');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							$.component(node_23, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return monitor().default_status;
									},

									onValueChange: (v) => {
										if (v) monitor(monitor().default_status = v, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root();
										var node_24 = $.first_child(fragment_12);

										$.component(node_24, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												id: 'monitor-default-status',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text();

													$.template_effect(() => $.set_text(text_7, monitor().default_status));
													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_25 = $.sibling(node_24, 2);

										$.component(node_25, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root_6();
													var node_26 = $.first_child(fragment_14);

													$.component(node_26, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															value: 'UP',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('UP');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													var node_27 = $.sibling(node_26, 2);

													$.component(node_27, () => Select.Item, ($$anchor, Select_Item_1) => {
														Select_Item_1($$anchor, {
															value: 'DOWN',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_9 = $.text('DOWN');

																$.append($$anchor, text_9);
															},
															$$slots: { default: true }
														});
													});

													var node_28 = $.sibling(node_27, 2);

													$.component(node_28, () => Select.Item, ($$anchor, Select_Item_2) => {
														Select_Item_2($$anchor, {
															value: 'DEGRADED',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text('DEGRADED');

																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});
													});

													var node_29 = $.sibling(node_28, 2);

													$.component(node_29, () => Select.Item, ($$anchor, Select_Item_3) => {
														Select_Item_3($$anchor, {
															value: 'MAINTENANCE',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('MAINTENANCE');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_12);

							var div_13 = $.sibling(div_12, 2);
							var node_30 = $.child(div_13);

							Label(node_30, {
								for: 'hidden-switch',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Hidden in Status Page');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var div_14 = $.sibling(node_30, 2);
							var node_31 = $.child(div_14);

							{
								let $0 = $.derived(() => monitor().is_hidden === "YES");

								Switch(node_31, {
									id: 'hidden-switch',
									get checked() {
										return $.get($0);
									},
									onCheckedChange: (checked) => monitor(monitor().is_hidden = checked ? "YES" : "NO", true)
								});
							}

							var span = $.sibling(node_31, 2);
							var text_13 = $.only_child(span, true);

							$.reset(div_14);
							$.next(2);
							$.reset(div_13);

							var div_15 = $.sibling(div_13, 2);
							var node_32 = $.child(div_15);

							Label(node_32, {
								for: 'monitor-confirmation-threshold',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Grace period');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_32, 2);

							{
								let $0 = $.derived(() => monitor().confirmation_threshold ?? 1);

								Input(node_33, {
									id: 'monitor-confirmation-threshold',
									type: 'number',
									min: '1',
									max: '60',
									step: '1',
									get value() {
										return $.get($0);
									},

									oninput: (e) => {
										const v = parseInt(e.currentTarget.value, 10);

										monitor(monitor().confirmation_threshold = Number.isNaN(v) ? 1 : Math.min(60, Math.max(1, v)), true);
									}
								});
							}

							$.next(2);
							$.reset(div_15);
							$.reset(div_11);

							$.template_effect(() => {
								input_1.disabled = $.get(uploadingImage);
								$.set_text(text_13, monitor().is_hidden === "YES" ? "Hidden" : "Visible");
							});

							$.delegated('change', input_1, handleImageUpload);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_34 = $.sibling(node_4, 2);

				$.component(node_34, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex justify-end',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								onclick: saveGeneralSettings,
								get disabled() {
									return $.get(savingGeneral);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root_8();
									var node_35 = $.first_child(fragment_16);

									{
										var consequent_3 = ($$anchor) => {
											Loader($$anchor, { class: 'size-4 animate-spin' });
										};

										var alternate_2 = ($$anchor) => {
											SaveIcon($$anchor, { class: 'size-4' });
										};

										$.if(node_35, ($$render) => {
											if ($.get(savingGeneral)) $$render(consequent_3); else $$render(alternate_2, -1);
										});
									}

									var text_15 = $.sibling(node_35);

									$.template_effect(() => $.set_text(text_15, ` ${$$props.isNew ? "Create Monitor" : "Save General Settings"}`));
									$.append($$anchor, fragment_16);
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

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change']);