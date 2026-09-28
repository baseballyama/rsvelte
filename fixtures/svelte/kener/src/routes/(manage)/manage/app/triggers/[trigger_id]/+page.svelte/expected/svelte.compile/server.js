import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { goto } from "$app/navigation";
import * as Alert from "$lib/components/ui/alert/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import PlusIcon from "@lucide/svelte/icons/plus";
import XIcon from "@lucide/svelte/icons/x";
import AlertCircleIcon from "@lucide/svelte/icons/octagon-alert";
import Loader from "@lucide/svelte/icons/loader";
import CheckIcon from "@lucide/svelte/icons/check";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import { toast } from "svelte-sonner";
import { onMount } from "svelte";
import { mode } from "mode-watcher";
import { IsValidURL } from "$lib/clientTools";
import CodeMirror from "svelte-codemirror-editor";
import { html } from "@codemirror/lang-html";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = page;

		// Types
		// State
		let loading = true;

		let saving = false;
		let testing = "idle";
		let invalidFormMessage = "";
		let deleteDialogOpen = false;
		let deleteConfirmName = "";
		let isDeleting = false;

		// Get trigger ID from URL params
		const triggerId = $.derived(() => data.trigger_id);

		const isNew = $.derived(() => triggerId() === "new");

		// Form state
		let trigger = {
			id: 0,
			name: "",
			trigger_type: "webhook",
			trigger_desc: "",
			trigger_status: "ACTIVE",
			trigger_meta: {
				url: "",
				headers: [],
				to: "",
				from: "",
				webhook_body: data.webhook_template.webhook_body,
				discord_body: data.discord_template.discord_body,
				slack_body: data.slack_template.slack_body,
				email_body: data.email_template.email_body,
				email_subject: data.email_template.email_subject
			}
		};

		async function fetchTrigger() {
			if (isNew()) {
				loading = false;

				return;
			}

			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getTriggers", data: {} })
				});

				const result = await response.json();
				const foundTrigger = result.find((t) => t.id === parseInt(triggerId() || "0"));

				if (foundTrigger) {
					const meta = JSON.parse(foundTrigger.trigger_meta);

					trigger = {
						id: foundTrigger.id,
						name: foundTrigger.name,
						trigger_type: foundTrigger.trigger_type,
						trigger_desc: foundTrigger.trigger_desc || "",
						trigger_status: foundTrigger.trigger_status || "ACTIVE",
						trigger_meta: {
							url: meta.url || "",
							headers: meta.headers || [],
							to: meta.to || "",
							from: meta.from || "",
							webhook_body: meta.webhook_body || data.webhook_template.webhook_body,
							discord_body: meta.discord_body || data.discord_template.discord_body,
							slack_body: meta.slack_body || data.slack_template.slack_body,
							email_body: meta.email_body || data.email_template.email_body,
							email_subject: meta.email_subject || data.email_template.email_subject
						}
					};
				} else {
					toast.error("Trigger not found");
					goto(clientResolver(resolve, "/manage/app/triggers"));
				}
			} catch(error) {
				console.error("Error fetching trigger:", error);
				toast.error("Failed to load trigger");
			} finally {
				loading = false;
			}
		}

		// Validation
		function validateNameEmailPattern(input) {
			const pattern = /^([\w\s]+)\s*<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>$/;
			const match = input.match(pattern);

			if (match) {
				return { isValid: true, name: match[1].trim(), email: match[2] };
			}

			return { isValid: false, name: null, email: null };
		}

		async function saveTrigger() {
			invalidFormMessage = "";

			// Validation
			if (!trigger.name.trim()) {
				invalidFormMessage = "Trigger Name is required";

				return;
			}

			if (!trigger.trigger_type) {
				invalidFormMessage = "Trigger Type is required";

				return;
			}

			if (trigger.trigger_type === "email") {
				if (!trigger.trigger_meta.to.trim()) {
					invalidFormMessage = "To Email Address is required";

					return;
				}

				if (!validateNameEmailPattern(trigger.trigger_meta.from).isValid) {
					invalidFormMessage = "Invalid Sender. Format: Name <email@example.com>";

					return;
				}
			} else {
				// URL validation for non-email triggers
				if (!trigger.trigger_meta.url.trim()) {
					invalidFormMessage = "Trigger URL is required";

					return;
				}

				if (!IsValidURL(trigger.trigger_meta.url)) {
					invalidFormMessage = "Invalid URL";

					return;
				}
			}

			saving = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "createUpdateTrigger",
						data: {
							id: trigger.id || undefined,
							name: trigger.name,
							trigger_type: trigger.trigger_type,
							trigger_status: trigger.trigger_status,
							trigger_desc: trigger.trigger_desc,
							trigger_meta: JSON.stringify(trigger.trigger_meta)
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					invalidFormMessage = result.error;
				} else {
					toast.success(trigger.id
						? "Trigger updated successfully"
						: "Trigger created successfully");

					if (isNew()) {
						goto(clientResolver(resolve, "/manage/app/triggers"));
					}
				}
			} catch(error) {
				invalidFormMessage = "Failed to save trigger";
			} finally {
				saving = false;
			}
		}

		async function testTrigger() {
			if (!trigger.id) {
				toast.error("Please save the trigger first");

				return;
			}

			testing = "loading";

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "testTrigger",
						data: { trigger_id: trigger.id, status: "TRIGGERED" }
					})
				});

				const result = await response.json();

				if (result.error) {
					testing = "error";
					toast.error(result.error);
				} else {
					testing = "success";
					toast.success("Test trigger sent successfully");
				}
			} catch(error) {
				testing = "error";
				toast.error("Failed to test trigger");
			} finally {
				setTimeout(
					() => {
						testing = "idle";
					},
					3000
				);
			}
		}

		function addHeader() {
			trigger.trigger_meta.headers = [...trigger.trigger_meta.headers, { key: "", value: "" }];
		}

		function removeHeader(index) {
			trigger.trigger_meta.headers = trigger.trigger_meta.headers.filter((_, i) => i !== index);
		}

		async function deleteTrigger() {
			if (!trigger.id || deleteConfirmName !== trigger.name) return;

			isDeleting = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "deleteTrigger", data: { trigger_id: trigger.id } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Trigger deleted successfully");
					goto(clientResolver(resolve, "/manage/app/triggers"));
				}
			} catch(error) {
				toast.error("Failed to delete trigger");
			} finally {
				isDeleting = false;
				deleteDialogOpen = false;
				deleteConfirmName = "";
			}
		}

		onMount(() => {
			fetchTrigger();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container space-y-6 py-6">`);

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
														href: clientResolver(resolve, "/manage/app/triggers"),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Triggers`);
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
															$$renderer.push(`<!---->${$.escape(isNew() ? "New Trigger" : trigger.name || "Edit Trigger")}`);
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

			$$renderer.push(` `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
				Spinner($$renderer, { class: 'size-8' });
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
													$$renderer.push(`<!---->${$.escape(isNew() ? "New Trigger" : "Edit Trigger")}`);
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
													$$renderer.push(`<!---->Configure notification triggers for your monitors`);
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
										if (invalidFormMessage) {
											$$renderer.push(`<!--[0--><div class="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">${$.escape(invalidFormMessage)}</div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <div class="space-y-3">`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Trigger Type`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Select the type of notification to send</p> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: trigger.trigger_type,
												onValueChange: (value) => {
													if (value) trigger.trigger_type = value;
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															class: 'w-full max-w-sm capitalize',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(trigger.trigger_type)}`);
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
																		value: 'webhook',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Webhook`);
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
																		value: 'discord',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Discord`);
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
																		value: 'slack',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Slack`);
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
																		value: 'email',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Email`);
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

										$$renderer.push(`</div> <div class="flex items-center justify-between rounded-lg border p-4"><div>`);

										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Status`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Enable or disable this trigger</p></div> `);

										Switch($$renderer, {
											checked: trigger.trigger_status === "ACTIVE",
											onCheckedChange: (checked) => trigger.trigger_status = checked ? "ACTIVE" : "INACTIVE"
										});

										$$renderer.push(`<!----></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'trigger-name',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Name <span class="text-destructive">*</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'trigger-name',
											placeholder: 'My Trigger',
											get value() {
												return trigger.name;
											},

											set value($$value) {
												trigger.name = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div class="space-y-2">`);

										Label($$renderer, {
											for: 'trigger-desc',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Description`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'trigger-desc',
											placeholder: 'Optional description',
											get value() {
												return trigger.trigger_desc;
											},

											set value($$value) {
												trigger.trigger_desc = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> `);

										if (trigger.trigger_type !== "email") {
											$$renderer.push(`<!--[0--><div class="space-y-2">`);

											Label($$renderer, {
												for: 'trigger-url',
												children: ($$renderer) => {
													$$renderer.push(`<!---->URL <span class="text-destructive">*</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'trigger-url',
												placeholder: 'https://example.com/webhook',
												get value() {
													return trigger.trigger_meta.url;
												},

												set value($$value) {
													trigger.trigger_meta.url = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">The URL to send notifications to</p></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (trigger.trigger_type === "webhook") {
											$$renderer.push(`<!--[0--><div class="space-y-3">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Headers`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="space-y-2"><!--[-->`);

											const each_array = $.ensure_array_like(trigger.trigger_meta.headers);

											for (let index = 0, $$length = each_array.length; index < $$length; index++) {
												let header = each_array[index];

												$$renderer.push(`<div class="flex gap-2">`);

												Input($$renderer, {
													placeholder: 'Header Key',
													class: 'flex-1',
													get value() {
														return header.key;
													},

													set value($$value) {
														header.key = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													placeholder: 'Header Value',
													class: 'flex-1',
													get value() {
														return header.value;
													},

													set value($$value) {
														header.value = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'ghost',
													size: 'icon',
													onclick: () => removeHeader(index),
													children: ($$renderer) => {
														XIcon($$renderer, { class: 'size-4' });
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----></div>`);
											}

											$$renderer.push(`<!--]--></div> `);

											Button($$renderer, {
												variant: 'outline',
												size: 'sm',
												onclick: addHeader,
												children: ($$renderer) => {
													PlusIcon($$renderer, { class: 'size-4' });
													$$renderer.push(`<!----> Add Header`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div> <div class="space-y-3"><div>`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Custom Webhook Body`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Override the default JSON payload</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables like <code class="bg-muted rounded px-1">{{variable}}</code>. Available:
              alert_id, alert_name, alert_for, alert_value, alert_status, alert_severity, alert_message, alert_source,
              alert_timestamp, alert_cta_url, alert_cta_text, alert_incident_id, alert_incident_url,
              alert_failure_threshold, alert_success_threshold, is_resolved, is_triggered, site_url, site_name,
              site_logo_url, colors_up, colors_down, colors_degraded, colors_maintenance</p> <div class="overflow-hidden rounded-md border">`);

											Textarea($$renderer, {
												get value() {
													return trigger.trigger_meta.webhook_body;
												},

												set value($$value) {
													trigger.trigger_meta.webhook_body = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (trigger.trigger_type === "discord") {
											$$renderer.push(`<!--[0--><div class="space-y-3"><div>`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Custom Discord Payload`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Override the default Discord message</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables. Available: alert_id, alert_name, alert_for, alert_value, alert_status,
              alert_severity, alert_message, alert_source, alert_timestamp, alert_cta_url, alert_cta_text,
              alert_incident_id, alert_incident_url, alert_failure_threshold, alert_success_threshold, is_resolved,
              is_triggered, site_url, site_name, site_logo_url, colors_up, colors_down, colors_degraded,
              colors_maintenance</p> <div class="overflow-hidden rounded-md border">`);

											Textarea($$renderer, {
												get value() {
													return trigger.trigger_meta.discord_body;
												},

												set value($$value) {
													trigger.trigger_meta.discord_body = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (trigger.trigger_type === "slack") {
											$$renderer.push(`<!--[0--><div class="space-y-3"><div>`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Custom Slack Payload`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Override the default Slack message</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables. Available: alert_id, alert_name, alert_for, alert_value, alert_status,
              alert_severity, alert_message, alert_source, alert_timestamp, alert_cta_url, alert_cta_text,
              alert_incident_id, alert_incident_url, alert_failure_threshold, alert_success_threshold, is_resolved,
              is_triggered, site_url, site_name, site_logo_url, colors_up, colors_down, colors_degraded,
              colors_maintenance</p> <div class="overflow-hidden rounded-md border">`);

											Textarea($$renderer, {
												get value() {
													return trigger.trigger_meta.slack_body;
												},

												set value($$value) {
													trigger.trigger_meta.slack_body = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (trigger.trigger_type === "email") {
											$$renderer.push('<!--[0-->');

											if (page.data.canSendEmail === false) {
												$$renderer.push('<!--[0-->');

												if (Alert.Root) {
													$$renderer.push('<!--[-->');

													Alert.Root($$renderer, {
														variant: 'destructive',
														children: ($$renderer) => {
															AlertCircleIcon($$renderer, {});
															$$renderer.push(`<!----> `);

															if (Alert.Title) {
																$$renderer.push('<!--[-->');

																Alert.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Email is not setup`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Alert.Description) {
																$$renderer.push('<!--[-->');

																Alert.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<p>Please visit the email set up documentation <a class="underline"${$.attr('href', clientResolver(resolve, "https://kener.ing/docs/v4/setup/email-setup"))}>here</a>.</p>`);
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

											$$renderer.push(`<!--]--> <div class="space-y-2">`);

											Label($$renderer, {
												for: 'email-to',
												children: ($$renderer) => {
													$$renderer.push(`<!---->To (comma separated) <span class="text-destructive">*</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'email-to',
												placeholder: 'john@example.com, jane@example.com',
												get value() {
													return trigger.trigger_meta.to;
												},

												set value($$value) {
													trigger.trigger_meta.to = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div> <div class="space-y-2">`);

											Label($$renderer, {
												for: 'email-from',
												children: ($$renderer) => {
													$$renderer.push(`<!---->From <span class="text-destructive">*</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'email-from',
												placeholder: 'Alerts <alert@example.com>',
												get value() {
													return trigger.trigger_meta.from;
												},

												set value($$value) {
													trigger.trigger_meta.from = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Format: Name &lt;email@example.com></p></div> <div class="space-y-3"><div>`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Custom HTML Template`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">Create your own email design</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables. Available: alert_id, alert_name, alert_for, alert_value, alert_status,
              alert_severity, alert_message, alert_source, alert_timestamp, alert_cta_url, alert_cta_text,
              alert_incident_id, alert_incident_url, alert_failure_threshold, alert_success_threshold, is_resolved,
              is_triggered, site_url, site_name, site_logo_url, colors_up, colors_down, colors_degraded,
              colors_maintenance</p> <div class="overflow-hidden rounded-md border">`);

											CodeMirror($$renderer, {
												lang: html(),
												theme: mode.current === "dark" ? githubDark : githubLight,
												styles: { "&": { width: "100%", height: "400px" } },
												get value() {
													return trigger.trigger_meta.email_body;
												},

												set value($$value) {
													trigger.trigger_meta.email_body = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div></div>`);
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
										if (!isNew()) {
											$$renderer.push('<!--[0-->');

											Button($$renderer, {
												variant: 'outline',
												onclick: testTrigger,
												disabled: testing === "loading",
												children: ($$renderer) => {
													if (testing === "loading") {
														$$renderer.push('<!--[0-->');
														Loader($$renderer, { class: 'size-4 animate-spin' });
													} else if (testing === "success") {
														$$renderer.push('<!--[1-->');
														CheckIcon($$renderer, { class: 'size-4 text-green-500' });
													} else if (testing === "error") {
														$$renderer.push('<!--[2-->');
														XIcon($$renderer, { class: 'size-4 text-red-500' });
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> Test Trigger`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Button($$renderer, {
											onclick: saveTrigger,
											disabled: saving,
											children: ($$renderer) => {
												if (saving) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'size-4 animate-spin' });
												} else {
													$$renderer.push('<!--[-1-->');
													SaveIcon($$renderer, { class: 'size-4' });
												}

												$$renderer.push(`<!--]--> ${$.escape(isNew() ? "Create" : "Save")} Trigger`);
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

				if (!isNew()) {
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
														$$renderer.push(`<!---->Permanently delete this trigger. This action cannot be undone.`);
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
										children: ($$renderer) => {
											$$renderer.push(`<p class="text-muted-foreground text-sm">Deleting this trigger will also remove it from all alert configurations that use it.</p>`);
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
												onclick: () => deleteDialogOpen = true,
												children: ($$renderer) => {
													Trash2Icon($$renderer, { class: 'size-4' });
													$$renderer.push(`<!----> Delete Trigger`);
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
			}

			$$renderer.push(`<!--]--></div> `);

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return deleteDialogOpen;
					},

					set open($$value) {
						deleteDialogOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete Trigger`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->This action cannot be undone. This will permanently delete the trigger and remove it from all alert
        configurations.`);
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

									$$renderer.push(` <div class="space-y-4 py-4"><p class="text-sm">To confirm, type <span class="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">${$.escape(trigger.name)}</span> below:</p> `);

									Input($$renderer, {
										placeholder: 'Type trigger name to confirm',
										get value() {
											return deleteConfirmName;
										},

										set value($$value) {
											deleteConfirmName = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														disabled: isDeleting,
														onclick: () => {
															deleteConfirmName = "";
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
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
													variant: 'destructive',
													onclick: deleteTrigger,
													disabled: isDeleting || deleteConfirmName !== trigger.name,
													children: ($$renderer) => {
														if (isDeleting) {
															$$renderer.push('<!--[0-->');
															Loader($$renderer, { class: 'size-4 animate-spin' });
														} else {
															$$renderer.push('<!--[-1-->');
															Trash2Icon($$renderer, { class: 'size-4' });
														}

														$$renderer.push(`<!--]--> Delete Trigger`);
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
	});
}