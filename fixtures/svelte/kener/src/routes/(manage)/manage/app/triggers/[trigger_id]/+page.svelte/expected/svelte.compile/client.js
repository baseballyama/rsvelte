import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="bg-destructive/10 text-destructive rounded-lg p-4 text-sm"> </div>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`Name <span class="text-destructive">*</span>`, 1);
var root_6 = $.from_html(`URL <span class="text-destructive">*</span>`, 1);
var root_7 = $.from_html(`<div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">The URL to send notifications to</p></div>`);
var root_8 = $.from_html(`<div class="flex gap-2"><!> <!> <!></div>`);
var root_9 = $.from_html(`<!> Add Header`, 1);

var root_10 = $.from_html(
	`<div class="space-y-3"><!> <div class="space-y-2"></div> <!></div> <div class="space-y-3"><div><!> <p class="text-muted-foreground text-sm">Override the default JSON payload</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables like <code class="bg-muted rounded px-1"></code>. Available:
              alert_id, alert_name, alert_for, alert_value, alert_status, alert_severity, alert_message, alert_source,
              alert_timestamp, alert_cta_url, alert_cta_text, alert_incident_id, alert_incident_url,
              alert_failure_threshold, alert_success_threshold, is_resolved, is_triggered, site_url, site_name,
              site_logo_url, colors_up, colors_down, colors_degraded, colors_maintenance</p> <div class="overflow-hidden rounded-md border"><!></div></div>`,
	1
);

var root_11 = $.from_html(`<div class="space-y-3"><div><!> <p class="text-muted-foreground text-sm">Override the default Discord message</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables. Available: alert_id, alert_name, alert_for, alert_value, alert_status,
              alert_severity, alert_message, alert_source, alert_timestamp, alert_cta_url, alert_cta_text,
              alert_incident_id, alert_incident_url, alert_failure_threshold, alert_success_threshold, is_resolved,
              is_triggered, site_url, site_name, site_logo_url, colors_up, colors_down, colors_degraded,
              colors_maintenance</p> <div class="overflow-hidden rounded-md border"><!></div></div>`);

var root_12 = $.from_html(`<div class="space-y-3"><div><!> <p class="text-muted-foreground text-sm">Override the default Slack message</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables. Available: alert_id, alert_name, alert_for, alert_value, alert_status,
              alert_severity, alert_message, alert_source, alert_timestamp, alert_cta_url, alert_cta_text,
              alert_incident_id, alert_incident_url, alert_failure_threshold, alert_success_threshold, is_resolved,
              is_triggered, site_url, site_name, site_logo_url, colors_up, colors_down, colors_degraded,
              colors_maintenance</p> <div class="overflow-hidden rounded-md border"><!></div></div>`);

var root_13 = $.from_html(`<p>Please visit the email set up documentation <a class="underline">here</a>.</p>`);
var root_14 = $.from_html(`To (comma separated) <span class="text-destructive">*</span>`, 1);
var root_15 = $.from_html(`From <span class="text-destructive">*</span>`, 1);

var root_16 = $.from_html(
	`<!> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">Format: Name &lt;email@example.com&gt;</p></div> <div class="space-y-3"><div><!> <p class="text-muted-foreground text-sm">Create your own email design</p></div> <p class="text-muted-foreground text-xs">Use Mustache variables. Available: alert_id, alert_name, alert_for, alert_value, alert_status,
              alert_severity, alert_message, alert_source, alert_timestamp, alert_cta_url, alert_cta_text,
              alert_incident_id, alert_incident_url, alert_failure_threshold, alert_success_threshold, is_resolved,
              is_triggered, site_url, site_name, site_logo_url, colors_up, colors_down, colors_degraded,
              colors_maintenance</p> <div class="overflow-hidden rounded-md border"><!></div></div>`,
	1
);

var root_17 = $.from_html(`<!> <div class="space-y-3"><!> <p class="text-muted-foreground text-sm">Select the type of notification to send</p> <!></div> <div class="flex items-center justify-between rounded-lg border p-4"><div><!> <p class="text-muted-foreground text-sm">Enable or disable this trigger</p></div> <!></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <!> <!> <!> <!> <!>`, 1);
var root_18 = $.from_html(`<!> Test Trigger`, 1);
var root_19 = $.from_html(`<!> `, 1);
var root_20 = $.from_html(`<p class="text-muted-foreground text-sm">Deleting this trigger will also remove it from all alert configurations that use it.</p>`);
var root_21 = $.from_html(`<!> Delete Trigger`, 1);
var root_22 = $.from_html(`<!> <div class="space-y-4 py-4"><p class="text-sm">To confirm, type <span class="bg-muted rounded px-1.5 py-0.5 font-mono text-sm"> </span> below:</p> <!></div> <!>`, 1);
var root_23 = $.from_html(`<div class="container space-y-6 py-6"><!> <!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let { data } = page;

	// Types
	// State
	let loading = $.state(true);

	let saving = $.state(false);
	let testing = $.state("idle");
	let invalidFormMessage = $.state("");
	let deleteDialogOpen = $.state(false);
	let deleteConfirmName = $.state("");
	let isDeleting = $.state(false);

	// Get trigger ID from URL params
	const triggerId = $.derived(() => data.trigger_id);

	const isNew = $.derived(() => $.get(triggerId) === "new");

	// Form state
	let trigger = $.state($.proxy({
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
	}));

	async function fetchTrigger() {
		if ($.get(isNew)) {
			$.set(loading, false);

			return;
		}

		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getTriggers", data: {} })
			});

			const result = await response.json();
			const foundTrigger = result.find((t) => t.id === parseInt($.get(triggerId) || "0"));

			if (foundTrigger) {
				const meta = JSON.parse(foundTrigger.trigger_meta);

				$.set(
					trigger,
					{
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
					},
					true
				);
			} else {
				toast.error("Trigger not found");
				goto(clientResolver(resolve, "/manage/app/triggers"));
			}
		} catch(error) {
			console.error("Error fetching trigger:", error);
			toast.error("Failed to load trigger");
		} finally {
			$.set(loading, false);
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
		$.set(invalidFormMessage, "");

		// Validation
		if (!$.get(trigger).name.trim()) {
			$.set(invalidFormMessage, "Trigger Name is required");

			return;
		}

		if (!$.get(trigger).trigger_type) {
			$.set(invalidFormMessage, "Trigger Type is required");

			return;
		}

		if ($.get(trigger).trigger_type === "email") {
			if (!$.get(trigger).trigger_meta.to.trim()) {
				$.set(invalidFormMessage, "To Email Address is required");

				return;
			}

			if (!validateNameEmailPattern($.get(trigger).trigger_meta.from).isValid) {
				$.set(invalidFormMessage, "Invalid Sender. Format: Name <email@example.com>");

				return;
			}
		} else {
			// URL validation for non-email triggers
			if (!$.get(trigger).trigger_meta.url.trim()) {
				$.set(invalidFormMessage, "Trigger URL is required");

				return;
			}

			if (!IsValidURL($.get(trigger).trigger_meta.url)) {
				$.set(invalidFormMessage, "Invalid URL");

				return;
			}
		}

		$.set(saving, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "createUpdateTrigger",
					data: {
						id: $.get(trigger).id || undefined,
						name: $.get(trigger).name,
						trigger_type: $.get(trigger).trigger_type,
						trigger_status: $.get(trigger).trigger_status,
						trigger_desc: $.get(trigger).trigger_desc,
						trigger_meta: JSON.stringify($.get(trigger).trigger_meta)
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				$.set(invalidFormMessage, result.error, true);
			} else {
				toast.success($.get(trigger).id
					? "Trigger updated successfully"
					: "Trigger created successfully");

				if ($.get(isNew)) {
					goto(clientResolver(resolve, "/manage/app/triggers"));
				}
			}
		} catch(error) {
			$.set(invalidFormMessage, "Failed to save trigger");
		} finally {
			$.set(saving, false);
		}
	}

	async function testTrigger() {
		if (!$.get(trigger).id) {
			toast.error("Please save the trigger first");

			return;
		}

		$.set(testing, "loading");

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "testTrigger",
					data: { trigger_id: $.get(trigger).id, status: "TRIGGERED" }
				})
			});

			const result = await response.json();

			if (result.error) {
				$.set(testing, "error");
				toast.error(result.error);
			} else {
				$.set(testing, "success");
				toast.success("Test trigger sent successfully");
			}
		} catch(error) {
			$.set(testing, "error");
			toast.error("Failed to test trigger");
		} finally {
			setTimeout(
				() => {
					$.set(testing, "idle");
				},
				3000
			);
		}
	}

	function addHeader() {
		$.get(trigger).trigger_meta.headers = [
			...$.get(trigger).trigger_meta.headers,
			{ key: "", value: "" }
		];
	}

	function removeHeader(index) {
		$.get(trigger).trigger_meta.headers = $.get(trigger).trigger_meta.headers.filter((_, i) => i !== index);
	}

	async function deleteTrigger() {
		if (!$.get(trigger).id || $.get(deleteConfirmName) !== $.get(trigger).name) return;

		$.set(isDeleting, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "deleteTrigger",
					data: { trigger_id: $.get(trigger).id }
				})
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
			$.set(isDeleting, false);
			$.set(deleteDialogOpen, false);
			$.set(deleteConfirmName, "");
		}
	}

	onMount(() => {
		fetchTrigger();
	});

	var fragment = root_23();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => clientResolver(resolve, "/manage/app/triggers"));

											$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
												Breadcrumb_Link($$anchor, {
													get href() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Triggers');

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

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
								Breadcrumb_Separator($$anchor, {});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
								Breadcrumb_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
											Breadcrumb_Page($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(isNew) ? "New Trigger" : $.get(trigger).name || "Edit Trigger"));
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

	var node_7 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var node_8 = $.child(div_1);

			Spinner(node_8, { class: 'size-8' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_6 = root_2();
			var node_9 = $.first_child(fragment_6);

			$.component(node_9, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_10 = $.first_child(fragment_7);

						$.component(node_10, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var node_11 = $.first_child(fragment_8);

									$.component(node_11, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, $.get(isNew) ? "New Trigger" : "Edit Trigger"));
												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Configure notification triggers for your monitors');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_10, 2);

						$.component(node_13, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_17();
									var node_14 = $.first_child(fragment_10);

									{
										var consequent_1 = ($$anchor) => {
											var div_2 = root_3();
											var text_4 = $.only_child(div_2, true);

											$.template_effect(() => $.set_text(text_4, $.get(invalidFormMessage)));
											$.append($$anchor, div_2);
										};

										$.if(node_14, ($$render) => {
											if ($.get(invalidFormMessage)) $$render(consequent_1);
										});
									}

									var div_3 = $.sibling(node_14, 2);
									var node_15 = $.child(div_3);

									Label(node_15, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Trigger Type');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_16 = $.sibling(node_15, 4);

									$.component(node_16, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(trigger).trigger_type;
											},

											onValueChange: (value) => {
												if (value) $.get(trigger).trigger_type = value;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_2();
												var node_17 = $.first_child(fragment_11);

												$.component(node_17, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														class: 'w-full max-w-sm capitalize',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text();

															$.template_effect(() => $.set_text(text_6, $.get(trigger).trigger_type));
															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_4();
															var node_19 = $.first_child(fragment_13);

															$.component(node_19, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	value: 'webhook',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Webhook');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_20 = $.sibling(node_19, 2);

															$.component(node_20, () => Select.Item, ($$anchor, Select_Item_1) => {
																Select_Item_1($$anchor, {
																	value: 'discord',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Discord');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_21 = $.sibling(node_20, 2);

															$.component(node_21, () => Select.Item, ($$anchor, Select_Item_2) => {
																Select_Item_2($$anchor, {
																	value: 'slack',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Slack');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_22 = $.sibling(node_21, 2);

															$.component(node_22, () => Select.Item, ($$anchor, Select_Item_3) => {
																Select_Item_3($$anchor, {
																	value: 'email',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Email');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_3);

									var div_4 = $.sibling(div_3, 2);
									var div_5 = $.child(div_4);
									var node_23 = $.child(div_5);

									Label(node_23, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('Status');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_5);

									var node_24 = $.sibling(div_5, 2);

									{
										let $0 = $.derived(() => $.get(trigger).trigger_status === "ACTIVE");

										Switch(node_24, {
											get checked() {
												return $.get($0);
											},
											onCheckedChange: (checked) => $.get(trigger).trigger_status = checked ? "ACTIVE" : "INACTIVE"
										});
									}

									$.reset(div_4);

									var div_6 = $.sibling(div_4, 2);
									var node_25 = $.child(div_6);

									Label(node_25, {
										for: 'trigger-name',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_14 = root_5();

											$.next();
											$.append($$anchor, fragment_14);
										},
										$$slots: { default: true }
									});

									var node_26 = $.sibling(node_25, 2);

									Input(node_26, {
										id: 'trigger-name',
										placeholder: 'My Trigger',
										get value() {
											return $.get(trigger).name;
										},

										set value($$value) {
											$.get(trigger).name = $$value;
										}
									});

									$.reset(div_6);

									var div_7 = $.sibling(div_6, 2);
									var node_27 = $.child(div_7);

									Label(node_27, {
										for: 'trigger-desc',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Description');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									var node_28 = $.sibling(node_27, 2);

									Input(node_28, {
										id: 'trigger-desc',
										placeholder: 'Optional description',
										get value() {
											return $.get(trigger).trigger_desc;
										},

										set value($$value) {
											$.get(trigger).trigger_desc = $$value;
										}
									});

									$.reset(div_7);

									var node_29 = $.sibling(div_7, 2);

									{
										var consequent_2 = ($$anchor) => {
											var div_8 = root_7();
											var node_30 = $.child(div_8);

											Label(node_30, {
												for: 'trigger-url',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_15 = root_6();

													$.next();
													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});

											var node_31 = $.sibling(node_30, 2);

											Input(node_31, {
												id: 'trigger-url',
												placeholder: 'https://example.com/webhook',
												get value() {
													return $.get(trigger).trigger_meta.url;
												},

												set value($$value) {
													$.get(trigger).trigger_meta.url = $$value;
												}
											});

											$.next(2);
											$.reset(div_8);
											$.append($$anchor, div_8);
										};

										$.if(node_29, ($$render) => {
											if ($.get(trigger).trigger_type !== "email") $$render(consequent_2);
										});
									}

									var node_32 = $.sibling(node_29, 2);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_16 = root_10();
											var div_9 = $.first_child(fragment_16);
											var node_33 = $.child(div_9);

											Label(node_33, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('Headers');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});

											var div_10 = $.sibling(node_33, 2);

											$.each(div_10, 21, () => $.get(trigger).trigger_meta.headers, $.index, ($$anchor, header, index) => {
												var div_11 = root_8();
												var node_34 = $.child(div_11);

												Input(node_34, {
													placeholder: 'Header Key',
													class: 'flex-1',
													get value() {
														return $.get(header).key;
													},

													set value($$value) {
														($.get(header).key = $$value);
													}
												});

												var node_35 = $.sibling(node_34, 2);

												Input(node_35, {
													placeholder: 'Header Value',
													class: 'flex-1',
													get value() {
														return $.get(header).value;
													},

													set value($$value) {
														($.get(header).value = $$value);
													}
												});

												var node_36 = $.sibling(node_35, 2);

												Button(node_36, {
													variant: 'ghost',
													size: 'icon',
													onclick: () => removeHeader(index),
													children: ($$anchor, $$slotProps) => {
														XIcon($$anchor, { class: 'size-4' });
													},
													$$slots: { default: true }
												});

												$.reset(div_11);
												$.append($$anchor, div_11);
											});

											$.reset(div_10);

											var node_37 = $.sibling(div_10, 2);

											Button(node_37, {
												variant: 'outline',
												size: 'sm',
												onclick: addHeader,
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = root_9();
													var node_38 = $.first_child(fragment_18);

													PlusIcon(node_38, { class: 'size-4' });
													$.next();
													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});

											$.reset(div_9);

											var div_12 = $.sibling(div_9, 2);
											var div_13 = $.child(div_12);
											var node_39 = $.child(div_13);

											Label(node_39, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Custom Webhook Body');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_13);

											var p = $.sibling(div_13, 2);
											var code = $.sibling($.child(p));

											code.textContent = '{{variable}}';
											$.next();
											$.reset(p);

											var div_14 = $.sibling(p, 2);
											var node_40 = $.child(div_14);

											Textarea(node_40, {
												get value() {
													return $.get(trigger).trigger_meta.webhook_body;
												},

												set value($$value) {
													$.get(trigger).trigger_meta.webhook_body = $$value;
												}
											});

											$.reset(div_14);
											$.reset(div_12);
											$.append($$anchor, fragment_16);
										};

										$.if(node_32, ($$render) => {
											if ($.get(trigger).trigger_type === "webhook") $$render(consequent_3);
										});
									}

									var node_41 = $.sibling(node_32, 2);

									{
										var consequent_4 = ($$anchor) => {
											var div_15 = root_11();
											var div_16 = $.child(div_15);
											var node_42 = $.child(div_16);

											Label(node_42, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Custom Discord Payload');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_16);

											var div_17 = $.sibling(div_16, 4);
											var node_43 = $.child(div_17);

											Textarea(node_43, {
												get value() {
													return $.get(trigger).trigger_meta.discord_body;
												},

												set value($$value) {
													$.get(trigger).trigger_meta.discord_body = $$value;
												}
											});

											$.reset(div_17);
											$.reset(div_15);
											$.append($$anchor, div_15);
										};

										$.if(node_41, ($$render) => {
											if ($.get(trigger).trigger_type === "discord") $$render(consequent_4);
										});
									}

									var node_44 = $.sibling(node_41, 2);

									{
										var consequent_5 = ($$anchor) => {
											var div_18 = root_12();
											var div_19 = $.child(div_18);
											var node_45 = $.child(div_19);

											Label(node_45, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Custom Slack Payload');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_19);

											var div_20 = $.sibling(div_19, 4);
											var node_46 = $.child(div_20);

											Textarea(node_46, {
												get value() {
													return $.get(trigger).trigger_meta.slack_body;
												},

												set value($$value) {
													$.get(trigger).trigger_meta.slack_body = $$value;
												}
											});

											$.reset(div_20);
											$.reset(div_18);
											$.append($$anchor, div_18);
										};

										$.if(node_44, ($$render) => {
											if ($.get(trigger).trigger_type === "slack") $$render(consequent_5);
										});
									}

									var node_47 = $.sibling(node_44, 2);

									{
										var consequent_7 = ($$anchor) => {
											var fragment_19 = root_16();
											var node_48 = $.first_child(fragment_19);

											{
												var consequent_6 = ($$anchor) => {
													var fragment_20 = $.comment();
													var node_49 = $.first_child(fragment_20);

													$.component(node_49, () => Alert.Root, ($$anchor, Alert_Root) => {
														Alert_Root($$anchor, {
															variant: 'destructive',
															children: ($$anchor, $$slotProps) => {
																var fragment_21 = root();
																var node_50 = $.first_child(fragment_21);

																AlertCircleIcon(node_50, {});

																var node_51 = $.sibling(node_50, 2);

																$.component(node_51, () => Alert.Title, ($$anchor, Alert_Title) => {
																	Alert_Title($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_17 = $.text('Email is not setup');

																			$.append($$anchor, text_17);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_52 = $.sibling(node_51, 2);

																$.component(node_52, () => Alert.Description, ($$anchor, Alert_Description) => {
																	Alert_Description($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var p_1 = root_13();
																			var a = $.sibling($.child(p_1));

																			$.next();
																			$.reset(p_1);

																			$.template_effect(($0) => $.set_attribute(a, 'href', $0), [
																				() => clientResolver(resolve, "https://kener.ing/docs/v4/setup/email-setup")
																			]);

																			$.append($$anchor, p_1);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_21);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_20);
												};

												$.if(node_48, ($$render) => {
													if (page.data.canSendEmail === false) $$render(consequent_6);
												});
											}

											var div_21 = $.sibling(node_48, 2);
											var node_53 = $.child(div_21);

											Label(node_53, {
												for: 'email-to',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_22 = root_14();

													$.next();
													$.append($$anchor, fragment_22);
												},
												$$slots: { default: true }
											});

											var node_54 = $.sibling(node_53, 2);

											Input(node_54, {
												id: 'email-to',
												placeholder: 'john@example.com, jane@example.com',
												get value() {
													return $.get(trigger).trigger_meta.to;
												},

												set value($$value) {
													$.get(trigger).trigger_meta.to = $$value;
												}
											});

											$.reset(div_21);

											var div_22 = $.sibling(div_21, 2);
											var node_55 = $.child(div_22);

											Label(node_55, {
												for: 'email-from',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_23 = root_15();

													$.next();
													$.append($$anchor, fragment_23);
												},
												$$slots: { default: true }
											});

											var node_56 = $.sibling(node_55, 2);

											Input(node_56, {
												id: 'email-from',
												placeholder: 'Alerts <alert@example.com>',
												get value() {
													return $.get(trigger).trigger_meta.from;
												},

												set value($$value) {
													$.get(trigger).trigger_meta.from = $$value;
												}
											});

											$.next(2);
											$.reset(div_22);

											var div_23 = $.sibling(div_22, 2);
											var div_24 = $.child(div_23);
											var node_57 = $.child(div_24);

											Label(node_57, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text('Custom HTML Template');

													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_24);

											var div_25 = $.sibling(div_24, 4);
											var node_58 = $.child(div_25);

											{
												let $0 = $.derived(html);
												let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

												CodeMirror(node_58, {
													get lang() {
														return $.get($0);
													},

													get theme() {
														return $.get($1);
													},
													styles: { "&": { width: "100%", height: "400px" } },
													get value() {
														return $.get(trigger).trigger_meta.email_body;
													},

													set value($$value) {
														$.get(trigger).trigger_meta.email_body = $$value;
													}
												});
											}

											$.reset(div_25);
											$.reset(div_23);
											$.append($$anchor, fragment_19);
										};

										$.if(node_47, ($$render) => {
											if ($.get(trigger).trigger_type === "email") $$render(consequent_7);
										});
									}

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_59 = $.sibling(node_13, 2);

						$.component(node_59, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex justify-end gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = root_2();
									var node_60 = $.first_child(fragment_24);

									{
										var consequent_11 = ($$anchor) => {
											{
												let $0 = $.derived(() => $.get(testing) === "loading");

												Button($$anchor, {
													variant: 'outline',
													onclick: testTrigger,
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_26 = root_18();
														var node_61 = $.first_child(fragment_26);

														{
															var consequent_8 = ($$anchor) => {
																Loader($$anchor, { class: 'size-4 animate-spin' });
															};

															var consequent_9 = ($$anchor) => {
																CheckIcon($$anchor, { class: 'size-4 text-green-500' });
															};

															var consequent_10 = ($$anchor) => {
																XIcon($$anchor, { class: 'size-4 text-red-500' });
															};

															$.if(node_61, ($$render) => {
																if ($.get(testing) === "loading") $$render(consequent_8); else if ($.get(testing) === "success") $$render(consequent_9, 1); else if ($.get(testing) === "error") $$render(consequent_10, 2);
															});
														}

														$.next();
														$.append($$anchor, fragment_26);
													},
													$$slots: { default: true }
												});
											}
										};

										$.if(node_60, ($$render) => {
											if (!$.get(isNew)) $$render(consequent_11);
										});
									}

									var node_62 = $.sibling(node_60, 2);

									Button(node_62, {
										onclick: saveTrigger,
										get disabled() {
											return $.get(saving);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_30 = root_19();
											var node_63 = $.first_child(fragment_30);

											{
												var consequent_12 = ($$anchor) => {
													Loader($$anchor, { class: 'size-4 animate-spin' });
												};

												var alternate = ($$anchor) => {
													SaveIcon($$anchor, { class: 'size-4' });
												};

												$.if(node_63, ($$render) => {
													if ($.get(saving)) $$render(consequent_12); else $$render(alternate, -1);
												});
											}

											var text_19 = $.sibling(node_63);

											$.template_effect(() => $.set_text(text_19, ` ${$.get(isNew) ? "Create" : "Save"} Trigger`));
											$.append($$anchor, fragment_30);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_24);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_64 = $.sibling(node_9, 2);

			{
				var consequent_13 = ($$anchor) => {
					var fragment_33 = $.comment();
					var node_65 = $.first_child(fragment_33);

					$.component(node_65, () => Card.Root, ($$anchor, Card_Root_1) => {
						Card_Root_1($$anchor, {
							class: 'border-destructive',
							children: ($$anchor, $$slotProps) => {
								var fragment_34 = root();
								var node_66 = $.first_child(fragment_34);

								$.component(node_66, () => Card.Header, ($$anchor, Card_Header_1) => {
									Card_Header_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_35 = root_2();
											var node_67 = $.first_child(fragment_35);

											$.component(node_67, () => Card.Title, ($$anchor, Card_Title_1) => {
												Card_Title_1($$anchor, {
													class: 'text-destructive',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_20 = $.text('Danger Zone');

														$.append($$anchor, text_20);
													},
													$$slots: { default: true }
												});
											});

											var node_68 = $.sibling(node_67, 2);

											$.component(node_68, () => Card.Description, ($$anchor, Card_Description_1) => {
												Card_Description_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_21 = $.text('Permanently delete this trigger. This action cannot be undone.');

														$.append($$anchor, text_21);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_35);
										},
										$$slots: { default: true }
									});
								});

								var node_69 = $.sibling(node_66, 2);

								$.component(node_69, () => Card.Content, ($$anchor, Card_Content_1) => {
									Card_Content_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var p_2 = root_20();

											$.append($$anchor, p_2);
										},
										$$slots: { default: true }
									});
								});

								var node_70 = $.sibling(node_69, 2);

								$.component(node_70, () => Card.Footer, ($$anchor, Card_Footer_1) => {
									Card_Footer_1($$anchor, {
										class: 'flex justify-end',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												variant: 'destructive',
												onclick: () => $.set(deleteDialogOpen, true),
												children: ($$anchor, $$slotProps) => {
													var fragment_37 = root_21();
													var node_71 = $.first_child(fragment_37);

													Trash2Icon(node_71, { class: 'size-4' });
													$.next();
													$.append($$anchor, fragment_37);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_34);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_33);
				};

				$.if(node_64, ($$render) => {
					if (!$.get(isNew)) $$render(consequent_13);
				});
			}

			$.append($$anchor, fragment_6);
		};

		$.if(node_7, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);

	var node_72 = $.sibling(div, 2);

	$.component(node_72, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(deleteDialogOpen);
			},

			set open($$value) {
				$.set(deleteDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_38 = $.comment();
				var node_73 = $.first_child(fragment_38);

				$.component(node_73, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_39 = root_22();
							var node_74 = $.first_child(fragment_39);

							$.component(node_74, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_40 = root_2();
										var node_75 = $.first_child(fragment_40);

										$.component(node_75, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_22 = $.text('Delete Trigger');

													$.append($$anchor, text_22);
												},
												$$slots: { default: true }
											});
										});

										var node_76 = $.sibling(node_75, 2);

										$.component(node_76, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_23 = $.text('This action cannot be undone. This will permanently delete the trigger and remove it from all alert\n        configurations.');

													$.append($$anchor, text_23);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_40);
									},
									$$slots: { default: true }
								});
							});

							var div_26 = $.sibling(node_74, 2);
							var p_3 = $.child(div_26);
							var span = $.sibling($.child(p_3));
							var text_24 = $.only_child(span, true);

							$.next();
							$.reset(p_3);

							var node_77 = $.sibling(p_3, 2);

							Input(node_77, {
								placeholder: 'Type trigger name to confirm',
								get value() {
									return $.get(deleteConfirmName);
								},

								set value($$value) {
									$.set(deleteConfirmName, $$value, true);
								}
							});

							$.reset(div_26);

							var node_78 = $.sibling(div_26, 2);

							$.component(node_78, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_41 = root_2();
										var node_79 = $.first_child(fragment_41);

										$.component(node_79, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												get disabled() {
													return $.get(isDeleting);
												},

												onclick: () => {
													$.set(deleteConfirmName, "");
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Cancel');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});
										});

										var node_80 = $.sibling(node_79, 2);

										{
											let $0 = $.derived(() => $.get(isDeleting) || $.get(deleteConfirmName) !== $.get(trigger).name);

											Button(node_80, {
												variant: 'destructive',
												onclick: deleteTrigger,
												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_42 = root_21();
													var node_81 = $.first_child(fragment_42);

													{
														var consequent_14 = ($$anchor) => {
															Loader($$anchor, { class: 'size-4 animate-spin' });
														};

														var alternate_2 = ($$anchor) => {
															Trash2Icon($$anchor, { class: 'size-4' });
														};

														$.if(node_81, ($$render) => {
															if ($.get(isDeleting)) $$render(consequent_14); else $$render(alternate_2, -1);
														});
													}

													$.next();
													$.append($$anchor, fragment_42);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_41);
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(() => $.set_text(text_24, $.get(trigger).name));
							$.append($$anchor, fragment_39);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_38);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}