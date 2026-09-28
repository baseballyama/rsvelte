import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Alert from "$lib/components/ui/alert/index.js";
import { toast } from "svelte-sonner";
import { format } from "date-fns";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { page as pageData } from "$app/state";
import Bell from "@lucide/svelte/icons/bell";
import PlusIcon from "@lucide/svelte/icons/plus";
import Trash2Icon from "@lucide/svelte/icons/trash-2";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
import Wrench from "@lucide/svelte/icons/wrench";
import Mail from "@lucide/svelte/icons/mail";
import Rss from "@lucide/svelte/icons/rss";
import AlertCircleIcon from "@lucide/svelte/icons/octagon-alert";

var root = $.from_html(`<!> Subscriptions Settings`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p>Please visit the email set up documentation <a class="underline">here</a>.</p>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex justify-center py-10"><!></div>`);
var root_5 = $.from_html(`<div class="space-y-4 border-l-2 pl-4"><p class="flex items-center gap-2 text-sm font-semibold"><!> Email Notifications</p> <div class="space-y-4 pl-4"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><!> <!></div> <!></div> <div class="flex items-center justify-between"><div class="flex items-center gap-2"><!> <!></div> <!></div></div></div>`);

var root_6 = $.from_html(`<div class="space-y-6"><div class="flex items-center justify-between"><!> <!></div> <!> <div class="space-y-4 border-l-2 pl-4"><p class="flex items-center gap-2 text-sm font-semibold"><!> RSS Feed</p> <div class="space-y-4 pl-4"><div class="flex items-center justify-between"><div class="space-y-0.5"><!> <p class="text-muted-foreground text-xs">Adds an RSS icon to the public page header. The feed routes
                    (<code class="text-xs">/rss.xml</code>) remain reachable either way.</p></div> <!></div></div></div></div>`);

var root_7 = $.from_html(`<!> Add Subscriber`, 1);
var root_8 = $.from_html(`<div class="flex items-center justify-between"><div><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);
var root_9 = $.from_html(`<div class="flex items-center justify-center gap-1"><!> Incidents</div>`);
var root_10 = $.from_html(`<div class="flex items-center justify-center gap-1"><!> Maintenances</div>`);
var root_11 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<div class="flex items-center justify-center gap-2"><!> <span class="text-muted-foreground text-sm">Loading subscribers...</span></div>`);
var root_13 = $.from_html(`<span class="text-muted-foreground px-1">...</span>`);
var root_14 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"></div> <!></div>`);
var root_15 = $.from_html(`<div class="mt-4 flex items-center justify-between"><span class="text-muted-foreground text-sm"> </span> <!></div>`);
var root_16 = $.from_html(`<div class="ktable rounded-xl border"><!></div> <!>`, 1);
var root_17 = $.from_html(`<!> Adding...`, 1);
var root_18 = $.from_html(`<!> <div class="space-y-4 py-4"><div class="space-y-2"><!> <!></div> <div class="space-y-4"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><!> <!></div> <!></div> <div class="flex items-center justify-between"><div class="flex items-center gap-2"><!> <!></div> <!></div></div> <!></div> <!>`, 1);
var root_19 = $.from_html(`<div class="py-4"><p class="text-sm"><span class="text-muted-foreground">Email:</span> <span class="font-medium"> </span></p></div>`);
var root_20 = $.from_html(`<!> Deleting...`, 1);
var root_21 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><!> <!></div> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Config state
	let config = $.state($.proxy({
		enable: false,
		methods: { emails: { incidents: true, maintenances: true } }
	}));

	let loadingConfig = $.state(true);
	let savingConfig = $.state(false);

	// RSS feed visibility — same site_data key as Site Configurations →
	// Sub Menu Options. Loaded/saved separately because it's independent of
	// the email-subscription toggles below.
	let subMenuOptions = $.state($.proxy({
		showShareBadgeMonitor: true,
		showShareEmbedMonitor: true,
		showRssFeed: true
	}));

	let savingRssToggle = $.state(false);

	async function fetchSubMenuOptions() {
		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getSiteDataByKey", data: { key: "subMenuOptions" } })
			});

			const data = await res.json();

			if (data && !data.error) {
				$.set(
					subMenuOptions,
					{
						showShareBadgeMonitor: data.showShareBadgeMonitor ?? true,
						showShareEmbedMonitor: data.showShareEmbedMonitor ?? true,
						showRssFeed: data.showRssFeed ?? true
					},
					true
				);
			}
		} catch {
			// Defaults already in state; silently fall through.
		}
	}

	async function toggleRssFeed(value) {
		const previous = $.get(subMenuOptions).showRssFeed;

		$.get(subMenuOptions).showRssFeed = value;
		$.set(savingRssToggle, true);

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "storeSiteData",
					data: { subMenuOptions: JSON.stringify($.get(subMenuOptions)) }
				})
			});

			const result = await res.json();

			if (result.error) throw new Error(result.error);

			toast.success("RSS feed preference saved");
		} catch {
			$.get(subMenuOptions).showRssFeed = previous;
			toast.error("Failed to save RSS feed preference");
		} finally {
			$.set(savingRssToggle, false);
		}
	}

	// Subscribers state
	let subscribers = $.state($.proxy([]));

	let loadingSubscribers = $.state(true);
	let page = $.state(1);
	let limit = 10;
	let total = $.state(0);
	let totalPages = $.state(0);

	// Add subscriber dialog
	let showAddDialog = $.state(false);

	let addingSubscriber = $.state(false);
	let newEmail = $.state("");
	let newIncidents = $.state(true);
	let newMaintenances = $.state(true);
	let addError = $.state("");

	// Delete confirmation
	let showDeleteDialog = $.state(false);

	let deletingSubscriber = $.state(null);
	let isDeleting = $.state(false);

	// Updating toggles
	let updatingToggle = $.proxy({});

	// Fetch config
	async function fetchConfig() {
		$.set(loadingConfig, true);

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getSubscriptionsConfig" })
			});

			$.set(config, await res.json(), true);
		} catch(error) {
			toast.error("Failed to load configuration");
		} finally {
			$.set(loadingConfig, false);
		}
	}

	// Save config
	async function saveConfig() {
		$.set(savingConfig, true);

		try {
			await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "updateSubscriptionsConfig", data: $.get(config) })
			});

			toast.success("Configuration saved");
		} catch(error) {
			toast.error("Failed to save configuration");
		} finally {
			$.set(savingConfig, false);
		}
	}

	// Fetch subscribers
	async function fetchSubscribers() {
		$.set(loadingSubscribers, true);

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getAdminSubscribers",
					data: { page: $.get(page), limit }
				})
			});

			const result = await res.json();

			if (!result.error) {
				$.set(subscribers, result.subscribers || [], true);
				$.set(total, result.total || 0, true);
				$.set(totalPages, result.totalPages || 0, true);
			}
		} catch(error) {
			toast.error("Failed to load subscribers");
		} finally {
			$.set(loadingSubscribers, false);
		}
	}

	// Toggle subscription status
	async function toggleSubscription(subscriber, eventType, enabled) {
		const key = `${subscriber.method_id}-${eventType}`;

		updatingToggle[key] = true;

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "adminUpdateSubscriptionStatus",
					data: { methodId: subscriber.method_id, eventType, enabled }
				})
			});

			const result = await res.json();

			if (result.error) {
				toast.error(result.error);

				// Revert toggle
				if (eventType === "incidents") {
					subscriber.incidents_enabled = !enabled;
				} else {
					subscriber.maintenances_enabled = !enabled;
				}
			} else {
				// Update local state
				if (eventType === "incidents") {
					subscriber.incidents_enabled = enabled;
				} else {
					subscriber.maintenances_enabled = enabled;
				}
			}
		} catch(error) {
			toast.error("Failed to update subscription");

			// Revert
			if (eventType === "incidents") {
				subscriber.incidents_enabled = !enabled;
			} else {
				subscriber.maintenances_enabled = !enabled;
			}
		} finally {
			updatingToggle[key] = false;
		}
	}

	// Add subscriber
	async function addSubscriber() {
		if (!$.get(newEmail).trim()) {
			$.set(addError, "Email is required");

			return;
		}

		$.set(addingSubscriber, true);
		$.set(addError, "");

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "adminAddSubscriber",
					data: {
						email: $.get(newEmail).trim(),
						incidents: $.get(newIncidents),
						maintenances: $.get(newMaintenances)
					}
				})
			});

			const result = await res.json();

			if (result.error) {
				$.set(addError, result.error, true);
			} else {
				$.set(showAddDialog, false);
				resetAddForm();
				toast.success("Subscriber added successfully");
				await fetchSubscribers();
			}
		} catch(error) {
			$.set(addError, "Failed to add subscriber");
		} finally {
			$.set(addingSubscriber, false);
		}
	}

	function resetAddForm() {
		$.set(newEmail, "");
		$.set(newIncidents, true);
		$.set(newMaintenances, true);
		$.set(addError, "");
	}

	// Delete subscriber
	async function deleteSubscriber() {
		if (!$.get(deletingSubscriber)) return;

		$.set(isDeleting, true);

		try {
			const res = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "adminDeleteSubscriber",
					data: { methodId: $.get(deletingSubscriber).method_id }
				})
			});

			const result = await res.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.set(showDeleteDialog, false);
				$.set(deletingSubscriber, null);
				toast.success("Subscriber deleted");
				await fetchSubscribers();
			}
		} catch(error) {
			toast.error("Failed to delete subscriber");
		} finally {
			$.set(isDeleting, false);
		}
	}

	function confirmDelete(subscriber) {
		$.set(deletingSubscriber, subscriber, true);
		$.set(showDeleteDialog, true);
	}

	function goToPage(newPage) {
		$.set(page, newPage, true);
		fetchSubscribers();
	}

	function handleConfigChange() {
		saveConfig();
	}

	onMount(() => {
		fetchConfig();
		fetchSubMenuOptions();
		fetchSubscribers();
	});

	var fragment = root_21();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'flex items-center gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										Bell(node_3, { class: 'h-5 w-5' });
										$.next();
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Configure subscription options for your status page');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'space-y-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_6 = $.first_child(fragment_4);

							{
								var consequent = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => Alert.Root, ($$anchor, Alert_Root) => {
										Alert_Root($$anchor, {
											variant: 'destructive',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_3();
												var node_8 = $.first_child(fragment_6);

												AlertCircleIcon(node_8, {});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Alert.Title, ($$anchor, Alert_Title) => {
													Alert_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Email is not setup');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Alert.Description, ($$anchor, Alert_Description) => {
													Alert_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var p = root_2();
															var a = $.sibling($.child(p));

															$.next();
															$.reset(p);

															$.template_effect(($0) => $.set_attribute(a, 'href', $0), [
																() => clientResolver(resolve, "https://kener.ing/docs/v4/setup/email-setup")
															]);

															$.append($$anchor, p);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								};

								$.if(node_6, ($$render) => {
									if (pageData.data.canSendEmail === false) $$render(consequent);
								});
							}

							var node_11 = $.sibling(node_6, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_1 = root_4();
									var node_12 = $.child(div_1);

									Spinner(node_12, {});
									$.reset(div_1);
									$.append($$anchor, div_1);
								};

								var alternate = ($$anchor) => {
									var div_2 = root_6();
									var div_3 = $.child(div_2);
									var node_13 = $.child(div_3);

									Label(node_13, {
										for: 'enable-subscriptions',
										class: 'mb-0',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Enable Subscriptions');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									Switch(node_14, {
										id: 'enable-subscriptions',
										get checked() {
											return $.get(config).enable;
										},

										onCheckedChange: (e) => {
											$.get(config).enable = e;
											$.get(config).methods.emails.incidents = e;
											$.get(config).methods.emails.maintenances = e;
											handleConfigChange();
										}
									});

									$.reset(div_3);

									var node_15 = $.sibling(div_3, 2);

									{
										var consequent_2 = ($$anchor) => {
											var div_4 = root_5();
											var p_1 = $.child(div_4);
											var node_16 = $.child(p_1);

											Mail(node_16, { class: 'h-4 w-4' });
											$.next();
											$.reset(p_1);

											var div_5 = $.sibling(p_1, 2);
											var div_6 = $.child(div_5);
											var div_7 = $.child(div_6);
											var node_17 = $.child(div_7);

											AlertTriangle(node_17, { class: 'h-4 w-4 text-orange-500' });

											var node_18 = $.sibling(node_17, 2);

											Label(node_18, {
												for: 'enable-email-incidents',
												class: 'mb-0',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Incident Updates');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											$.reset(div_7);

											var node_19 = $.sibling(div_7, 2);

											Switch(node_19, {
												id: 'enable-email-incidents',
												get checked() {
													return $.get(config).methods.emails.incidents;
												},

												onCheckedChange: (e) => {
													$.get(config).methods.emails.incidents = e;
													handleConfigChange();
												}
											});

											$.reset(div_6);

											var div_8 = $.sibling(div_6, 2);
											var div_9 = $.child(div_8);
											var node_20 = $.child(div_9);

											Wrench(node_20, { class: 'h-4 w-4 text-blue-500' });

											var node_21 = $.sibling(node_20, 2);

											Label(node_21, {
												for: 'enable-email-maintenances',
												class: 'mb-0',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Maintenance Updates');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											$.reset(div_9);

											var node_22 = $.sibling(div_9, 2);

											Switch(node_22, {
												id: 'enable-email-maintenances',
												get checked() {
													return $.get(config).methods.emails.maintenances;
												},

												onCheckedChange: (e) => {
													$.get(config).methods.emails.maintenances = e;
													handleConfigChange();
												}
											});

											$.reset(div_8);
											$.reset(div_5);
											$.reset(div_4);
											$.append($$anchor, div_4);
										};

										$.if(node_15, ($$render) => {
											if ($.get(config).enable) $$render(consequent_2);
										});
									}

									var div_10 = $.sibling(node_15, 2);
									var p_2 = $.child(div_10);
									var node_23 = $.child(p_2);

									Rss(node_23, { class: 'h-4 w-4' });
									$.next();
									$.reset(p_2);

									var div_11 = $.sibling(p_2, 2);
									var div_12 = $.child(div_11);
									var div_13 = $.child(div_12);
									var node_24 = $.child(div_13);

									Label(node_24, {
										for: 'enable-rss-feed',
										class: 'mb-0',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Show RSS feed link');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_13);

									var node_25 = $.sibling(div_13, 2);

									Switch(node_25, {
										id: 'enable-rss-feed',
										get checked() {
											return $.get(subMenuOptions).showRssFeed;
										},

										get disabled() {
											return $.get(savingRssToggle);
										},
										onCheckedChange: toggleRssFeed
									});

									$.reset(div_12);
									$.reset(div_11);
									$.reset(div_10);
									$.reset(div_2);
									$.append($$anchor, div_2);
								};

								$.if(node_11, ($$render) => {
									if ($.get(loadingConfig)) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_26 = $.sibling(node, 2);

	$.component(node_26, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var node_27 = $.first_child(fragment_7);

				$.component(node_27, () => Card.Header, ($$anchor, Card_Header_1) => {
					Card_Header_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_14 = root_8();
							var div_15 = $.child(div_14);
							var node_28 = $.child(div_15);

							$.component(node_28, () => Card.Title, ($$anchor, Card_Title_1) => {
								Card_Title_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Subscribers');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							var node_29 = $.sibling(node_28, 2);

							$.component(node_29, () => Card.Description, ($$anchor, Card_Description_1) => {
								Card_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('Manage email subscribers for notifications');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_15);

							var div_16 = $.sibling(div_15, 2);
							var node_30 = $.child(div_16);

							{
								var consequent_3 = ($$anchor) => {
									Spinner($$anchor, { class: 'size-5' });
								};

								$.if(node_30, ($$render) => {
									if ($.get(loadingSubscribers)) $$render(consequent_3);
								});
							}

							var node_31 = $.sibling(node_30, 2);

							Button(node_31, {
								onclick: () => $.set(showAddDialog, true),
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_7();
									var node_32 = $.first_child(fragment_9);

									PlusIcon(node_32, { class: 'h-4 w-4' });
									$.next();
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							$.reset(div_16);
							$.reset(div_14);
							$.append($$anchor, div_14);
						},
						$$slots: { default: true }
					});
				});

				var node_33 = $.sibling(node_27, 2);

				$.component(node_33, () => Card.Content, ($$anchor, Card_Content_1) => {
					Card_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_16();
							var div_17 = $.first_child(fragment_10);
							var node_34 = $.child(div_17);

							$.component(node_34, () => Table.Root, ($$anchor, Table_Root) => {
								Table_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_1();
										var node_35 = $.first_child(fragment_11);

										$.component(node_35, () => Table.Header, ($$anchor, Table_Header) => {
											Table_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = $.comment();
													var node_36 = $.first_child(fragment_12);

													$.component(node_36, () => Table.Row, ($$anchor, Table_Row) => {
														Table_Row($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root_11();
																var node_37 = $.first_child(fragment_13);

																$.component(node_37, () => Table.Head, ($$anchor, Table_Head) => {
																	Table_Head($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Email');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_38 = $.sibling(node_37, 2);

																$.component(node_38, () => Table.Head, ($$anchor, Table_Head_1) => {
																	Table_Head_1($$anchor, {
																		class: 'text-center',
																		children: ($$anchor, $$slotProps) => {
																			var div_18 = root_9();
																			var node_39 = $.child(div_18);

																			AlertTriangle(node_39, { class: 'h-4 w-4 text-orange-500' });
																			$.next();
																			$.reset(div_18);
																			$.append($$anchor, div_18);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_40 = $.sibling(node_38, 2);

																$.component(node_40, () => Table.Head, ($$anchor, Table_Head_2) => {
																	Table_Head_2($$anchor, {
																		class: 'text-center',
																		children: ($$anchor, $$slotProps) => {
																			var div_19 = root_10();
																			var node_41 = $.child(div_19);

																			Wrench(node_41, { class: 'h-4 w-4 text-blue-500' });
																			$.next();
																			$.reset(div_19);
																			$.append($$anchor, div_19);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_42 = $.sibling(node_40, 2);

																$.component(node_42, () => Table.Head, ($$anchor, Table_Head_3) => {
																	Table_Head_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text('Subscribed At');

																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_43 = $.sibling(node_42, 2);

																$.component(node_43, () => Table.Head, ($$anchor, Table_Head_4) => {
																	Table_Head_4($$anchor, {
																		class: 'w-20 text-center',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text('Actions');

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

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										var node_44 = $.sibling(node_35, 2);

										$.component(node_44, () => Table.Body, ($$anchor, Table_Body) => {
											Table_Body($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = $.comment();
													var node_45 = $.first_child(fragment_14);

													{
														var consequent_4 = ($$anchor) => {
															var fragment_15 = $.comment();
															var node_46 = $.first_child(fragment_15);

															$.component(node_46, () => Table.Row, ($$anchor, Table_Row_1) => {
																Table_Row_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_16 = $.comment();
																		var node_47 = $.first_child(fragment_16);

																		$.component(node_47, () => Table.Cell, ($$anchor, Table_Cell) => {
																			Table_Cell($$anchor, {
																				colspan: 5,
																				class: 'py-8 text-center',
																				children: ($$anchor, $$slotProps) => {
																					var div_20 = root_12();
																					var node_48 = $.child(div_20);

																					Spinner(node_48, { class: 'size-4' });
																					$.next(2);
																					$.reset(div_20);
																					$.append($$anchor, div_20);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_16);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_15);
														};

														var consequent_5 = ($$anchor) => {
															var fragment_17 = $.comment();
															var node_49 = $.first_child(fragment_17);

															$.component(node_49, () => Table.Row, ($$anchor, Table_Row_2) => {
																Table_Row_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_18 = $.comment();
																		var node_50 = $.first_child(fragment_18);

																		$.component(node_50, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																			Table_Cell_1($$anchor, {
																				colspan: 5,
																				class: 'text-muted-foreground py-8 text-center',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_11 = $.text('No subscribers yet. Add your first subscriber above.');

																					$.append($$anchor, text_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_18);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_17);
														};

														var alternate_1 = ($$anchor) => {
															var fragment_19 = $.comment();
															var node_51 = $.first_child(fragment_19);

															$.each(node_51, 17, () => $.get(subscribers), (subscriber) => subscriber.method_id, ($$anchor, subscriber) => {
																var fragment_20 = $.comment();
																var node_52 = $.first_child(fragment_20);

																$.component(node_52, () => Table.Row, ($$anchor, Table_Row_3) => {
																	Table_Row_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_21 = root_11();
																			var node_53 = $.first_child(fragment_21);

																			$.component(node_53, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																				Table_Cell_2($$anchor, {
																					class: 'font-medium',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_12 = $.text();

																						$.template_effect(() => $.set_text(text_12, $.get(subscriber).email));
																						$.append($$anchor, text_12);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_54 = $.sibling(node_53, 2);

																			$.component(node_54, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																				Table_Cell_3($$anchor, {
																					class: 'text-center',
																					children: ($$anchor, $$slotProps) => {
																						Switch($$anchor, {
																							get checked() {
																								return $.get(subscriber).incidents_enabled;
																							},

																							get disabled() {
																								return updatingToggle[`${$.get(subscriber).method_id}-incidents`];
																							},
																							onCheckedChange: (e) => toggleSubscription($.get(subscriber), "incidents", e)
																						});
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_55 = $.sibling(node_54, 2);

																			$.component(node_55, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																				Table_Cell_4($$anchor, {
																					class: 'text-center',
																					children: ($$anchor, $$slotProps) => {
																						Switch($$anchor, {
																							get checked() {
																								return $.get(subscriber).maintenances_enabled;
																							},

																							get disabled() {
																								return updatingToggle[`${$.get(subscriber).method_id}-maintenances`];
																							},
																							onCheckedChange: (e) => toggleSubscription($.get(subscriber), "maintenances", e)
																						});
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_56 = $.sibling(node_55, 2);

																			$.component(node_56, () => Table.Cell, ($$anchor, Table_Cell_5) => {
																				Table_Cell_5($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_13 = $.text();

																						$.template_effect(($0) => $.set_text(text_13, $0), [
																							() => format(new Date($.get(subscriber).created_at), "MMM d, yyyy")
																						]);

																						$.append($$anchor, text_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_57 = $.sibling(node_56, 2);

																			$.component(node_57, () => Table.Cell, ($$anchor, Table_Cell_6) => {
																				Table_Cell_6($$anchor, {
																					class: 'text-center',
																					children: ($$anchor, $$slotProps) => {
																						Button($$anchor, {
																							variant: 'ghost',
																							size: 'icon',
																							class: 'text-destructive hover:bg-destructive/10 h-8 w-8',
																							onclick: () => confirmDelete($.get(subscriber)),
																							children: ($$anchor, $$slotProps) => {
																								Trash2Icon($$anchor, { class: 'h-4 w-4' });
																							},
																							$$slots: { default: true }
																						});
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
															});

															$.append($$anchor, fragment_19);
														};

														$.if(node_45, ($$render) => {
															if ($.get(loadingSubscribers) && $.get(subscribers).length === 0) $$render(consequent_4); else if ($.get(subscribers).length === 0) $$render(consequent_5, 1); else $$render(alternate_1, -1);
														});
													}

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_17);

							var node_58 = $.sibling(div_17, 2);

							{
								var consequent_9 = ($$anchor) => {
									const startItem = $.derived(() => ($.get(page) - 1) * limit + 1);
									const endItem = $.derived(() => Math.min($.get(page) * limit, $.get(total)));
									var div_21 = root_15();
									var span = $.child(div_21);
									var text_14 = $.only_child(span);
									var node_59 = $.sibling(span, 2);

									{
										var consequent_8 = ($$anchor) => {
											var div_22 = root_14();
											var node_60 = $.child(div_22);

											{
												let $0 = $.derived(() => $.get(page) === 1);

												Button(node_60, {
													variant: 'outline',
													size: 'icon',
													get disabled() {
														return $.get($0);
													},
													onclick: () => goToPage($.get(page) - 1),
													children: ($$anchor, $$slotProps) => {
														ChevronLeftIcon($$anchor, { class: 'size-4' });
													},
													$$slots: { default: true }
												});
											}

											var div_23 = $.sibling(node_60, 2);

											$.each(div_23, 20, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), (pageNum) => pageNum, ($$anchor, pageNum) => {
												var fragment_29 = $.comment();
												var node_61 = $.first_child(fragment_29);

												{
													var consequent_6 = ($$anchor) => {
														{
															let $0 = $.derived(() => pageNum === $.get(page) ? "default" : "ghost");

															Button($$anchor, {
																get variant() {
																	return $.get($0);
																},
																size: 'sm',
																onclick: () => goToPage(pageNum),
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_15 = $.text();

																	$.template_effect(() => $.set_text(text_15, pageNum));
																	$.append($$anchor, text_15);
																},
																$$slots: { default: true }
															});
														}
													};

													var consequent_7 = ($$anchor) => {
														var span_1 = root_13();

														$.append($$anchor, span_1);
													};

													$.if(node_61, ($$render) => {
														if (pageNum === 1 || pageNum === $.get(totalPages) || pageNum >= $.get(page) - 1 && pageNum <= $.get(page) + 1) $$render(consequent_6); else if (pageNum === $.get(page) - 2 || pageNum === $.get(page) + 2) $$render(consequent_7, 1);
													});
												}

												$.append($$anchor, fragment_29);
											});

											$.reset(div_23);

											var node_62 = $.sibling(div_23, 2);

											{
												let $0 = $.derived(() => $.get(page) === $.get(totalPages));

												Button(node_62, {
													variant: 'outline',
													size: 'icon',
													get disabled() {
														return $.get($0);
													},
													onclick: () => goToPage($.get(page) + 1),
													children: ($$anchor, $$slotProps) => {
														ChevronRightIcon($$anchor, { class: 'size-4' });
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_22);
											$.append($$anchor, div_22);
										};

										$.if(node_59, ($$render) => {
											if ($.get(totalPages) > 1) $$render(consequent_8);
										});
									}

									$.reset(div_21);
									$.template_effect(() => $.set_text(text_14, `Showing ${$.get(startItem) ?? ''}-${$.get(endItem) ?? ''} of ${$.get(total) ?? ''}`));
									$.append($$anchor, div_21);
								};

								$.if(node_58, ($$render) => {
									if ($.get(total) > 0) $$render(consequent_9);
								});
							}

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	var node_63 = $.sibling(div, 2);

	$.component(node_63, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(showAddDialog);
			},

			set open($$value) {
				$.set(showAddDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_33 = $.comment();
				var node_64 = $.first_child(fragment_33);

				$.component(node_64, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-md',
						children: ($$anchor, $$slotProps) => {
							var fragment_34 = root_18();
							var node_65 = $.first_child(fragment_34);

							$.component(node_65, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_35 = root_1();
										var node_66 = $.first_child(fragment_35);

										$.component(node_66, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Add Subscriber');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										var node_67 = $.sibling(node_66, 2);

										$.component(node_67, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Add a new email subscriber for notifications');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_35);
									},
									$$slots: { default: true }
								});
							});

							var div_24 = $.sibling(node_65, 2);
							var div_25 = $.child(div_24);
							var node_68 = $.child(div_25);

							Label(node_68, {
								for: 'new-email',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Email Address');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_69 = $.sibling(node_68, 2);

							Input(node_69, {
								id: 'new-email',
								type: 'email',
								placeholder: 'subscriber@example.com',
								get disabled() {
									return $.get(addingSubscriber);
								},

								get value() {
									return $.get(newEmail);
								},

								set value($$value) {
									$.set(newEmail, $$value, true);
								}
							});

							$.reset(div_25);

							var div_26 = $.sibling(div_25, 2);
							var div_27 = $.child(div_26);
							var div_28 = $.child(div_27);
							var node_70 = $.child(div_28);

							AlertTriangle(node_70, { class: 'h-4 w-4 text-orange-500' });

							var node_71 = $.sibling(node_70, 2);

							Label(node_71, {
								for: 'new-incidents',
								class: 'mb-0',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('Subscribe to Incidents');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							$.reset(div_28);

							var node_72 = $.sibling(div_28, 2);

							Switch(node_72, {
								id: 'new-incidents',
								get disabled() {
									return $.get(addingSubscriber);
								},

								get checked() {
									return $.get(newIncidents);
								},

								set checked($$value) {
									$.set(newIncidents, $$value, true);
								}
							});

							$.reset(div_27);

							var div_29 = $.sibling(div_27, 2);
							var div_30 = $.child(div_29);
							var node_73 = $.child(div_30);

							Wrench(node_73, { class: 'h-4 w-4 text-blue-500' });

							var node_74 = $.sibling(node_73, 2);

							Label(node_74, {
								for: 'new-maintenances',
								class: 'mb-0',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_20 = $.text('Subscribe to Maintenances');

									$.append($$anchor, text_20);
								},
								$$slots: { default: true }
							});

							$.reset(div_30);

							var node_75 = $.sibling(div_30, 2);

							Switch(node_75, {
								id: 'new-maintenances',
								get disabled() {
									return $.get(addingSubscriber);
								},

								get checked() {
									return $.get(newMaintenances);
								},

								set checked($$value) {
									$.set(newMaintenances, $$value, true);
								}
							});

							$.reset(div_29);
							$.reset(div_26);

							var node_76 = $.sibling(div_26, 2);

							{
								var consequent_10 = ($$anchor) => {
									var fragment_36 = $.comment();
									var node_77 = $.first_child(fragment_36);

									$.component(node_77, () => Alert.Root, ($$anchor, Alert_Root_1) => {
										Alert_Root_1($$anchor, {
											variant: 'destructive',
											children: ($$anchor, $$slotProps) => {
												var fragment_37 = $.comment();
												var node_78 = $.first_child(fragment_37);

												$.component(node_78, () => Alert.Description, ($$anchor, Alert_Description_1) => {
													Alert_Description_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_21 = $.text();

															$.template_effect(() => $.set_text(text_21, $.get(addError)));
															$.append($$anchor, text_21);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_37);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_36);
								};

								$.if(node_76, ($$render) => {
									if ($.get(addError)) $$render(consequent_10);
								});
							}

							$.reset(div_24);

							var node_79 = $.sibling(div_24, 2);

							$.component(node_79, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_39 = root_1();
										var node_80 = $.first_child(fragment_39);

										Button(node_80, {
											variant: 'outline',
											onclick: () => {
												$.set(showAddDialog, false);
												resetAddForm();
											},

											get disabled() {
												return $.get(addingSubscriber);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_22 = $.text('Cancel');

												$.append($$anchor, text_22);
											},
											$$slots: { default: true }
										});

										var node_81 = $.sibling(node_80, 2);

										Button(node_81, {
											onclick: addSubscriber,
											get disabled() {
												return $.get(addingSubscriber);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_40 = $.comment();
												var node_82 = $.first_child(fragment_40);

												{
													var consequent_11 = ($$anchor) => {
														var fragment_41 = root_17();
														var node_83 = $.first_child(fragment_41);

														Spinner(node_83, { class: 'size-4' });
														$.next();
														$.append($$anchor, fragment_41);
													};

													var alternate_2 = ($$anchor) => {
														var text_23 = $.text('Add Subscriber');

														$.append($$anchor, text_23);
													};

													$.if(node_82, ($$render) => {
														if ($.get(addingSubscriber)) $$render(consequent_11); else $$render(alternate_2, -1);
													});
												}

												$.append($$anchor, fragment_40);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_39);
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
			},
			$$slots: { default: true }
		});
	});

	var node_84 = $.sibling(node_63, 2);

	$.component(node_84, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(showDeleteDialog);
			},

			set open($$value) {
				$.set(showDeleteDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_42 = $.comment();
				var node_85 = $.first_child(fragment_42);

				$.component(node_85, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'sm:max-w-md',
						children: ($$anchor, $$slotProps) => {
							var fragment_43 = root_3();
							var node_86 = $.first_child(fragment_43);

							$.component(node_86, () => Dialog.Header, ($$anchor, Dialog_Header_1) => {
								Dialog_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_44 = root_1();
										var node_87 = $.first_child(fragment_44);

										$.component(node_87, () => Dialog.Title, ($$anchor, Dialog_Title_1) => {
											Dialog_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_24 = $.text('Delete Subscriber');

													$.append($$anchor, text_24);
												},
												$$slots: { default: true }
											});
										});

										var node_88 = $.sibling(node_87, 2);

										$.component(node_88, () => Dialog.Description, ($$anchor, Dialog_Description_1) => {
											Dialog_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Are you sure you want to delete this subscriber? This action cannot be undone.');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_44);
									},
									$$slots: { default: true }
								});
							});

							var node_89 = $.sibling(node_86, 2);

							{
								var consequent_12 = ($$anchor) => {
									var div_31 = root_19();
									var p_3 = $.child(div_31);
									var span_2 = $.sibling($.child(p_3), 2);
									var text_26 = $.only_child(span_2, true);

									$.reset(p_3);
									$.reset(div_31);
									$.template_effect(() => $.set_text(text_26, $.get(deletingSubscriber).email));
									$.append($$anchor, div_31);
								};

								$.if(node_89, ($$render) => {
									if ($.get(deletingSubscriber)) $$render(consequent_12);
								});
							}

							var node_90 = $.sibling(node_89, 2);

							$.component(node_90, () => Dialog.Footer, ($$anchor, Dialog_Footer_1) => {
								Dialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_45 = root_1();
										var node_91 = $.first_child(fragment_45);

										Button(node_91, {
											variant: 'outline',
											onclick: () => {
												$.set(showDeleteDialog, false);
												$.set(deletingSubscriber, null);
											},

											get disabled() {
												return $.get(isDeleting);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_27 = $.text('Cancel');

												$.append($$anchor, text_27);
											},
											$$slots: { default: true }
										});

										var node_92 = $.sibling(node_91, 2);

										Button(node_92, {
											variant: 'destructive',
											onclick: deleteSubscriber,
											get disabled() {
												return $.get(isDeleting);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_46 = $.comment();
												var node_93 = $.first_child(fragment_46);

												{
													var consequent_13 = ($$anchor) => {
														var fragment_47 = root_20();
														var node_94 = $.first_child(fragment_47);

														Spinner(node_94, { class: 'size-4' });
														$.next();
														$.append($$anchor, fragment_47);
													};

													var alternate_3 = ($$anchor) => {
														var text_28 = $.text('Delete');

														$.append($$anchor, text_28);
													};

													$.if(node_93, ($$render) => {
														if ($.get(isDeleting)) $$render(consequent_13); else $$render(alternate_3, -1);
													});
												}

												$.append($$anchor, fragment_46);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_45);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_43);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_42);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}