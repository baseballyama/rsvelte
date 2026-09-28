import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Config state
		let config = {
			enable: false,
			methods: { emails: { incidents: true, maintenances: true } }
		};

		let loadingConfig = true;
		let savingConfig = false;

		// RSS feed visibility — same site_data key as Site Configurations →
		// Sub Menu Options. Loaded/saved separately because it's independent of
		// the email-subscription toggles below.
		let subMenuOptions = {
			showShareBadgeMonitor: true,
			showShareEmbedMonitor: true,
			showRssFeed: true
		};

		let savingRssToggle = false;

		async function fetchSubMenuOptions() {
			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getSiteDataByKey", data: { key: "subMenuOptions" } })
				});

				const data = await res.json();

				if (data && !data.error) {
					subMenuOptions = {
						showShareBadgeMonitor: data.showShareBadgeMonitor ?? true,
						showShareEmbedMonitor: data.showShareEmbedMonitor ?? true,
						showRssFeed: data.showRssFeed ?? true
					};
				}
			} catch {
				// Defaults already in state; silently fall through.
			}
		}

		async function toggleRssFeed(value) {
			const previous = subMenuOptions.showRssFeed;

			subMenuOptions.showRssFeed = value;
			savingRssToggle = true;

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeSiteData",
						data: { subMenuOptions: JSON.stringify(subMenuOptions) }
					})
				});

				const result = await res.json();

				if (result.error) throw new Error(result.error);

				toast.success("RSS feed preference saved");
			} catch {
				subMenuOptions.showRssFeed = previous;
				toast.error("Failed to save RSS feed preference");
			} finally {
				savingRssToggle = false;
			}
		}

		// Subscribers state
		let subscribers = [];

		let loadingSubscribers = true;
		let page = 1;
		let limit = 10;
		let total = 0;
		let totalPages = 0;

		// Add subscriber dialog
		let showAddDialog = false;

		let addingSubscriber = false;
		let newEmail = "";
		let newIncidents = true;
		let newMaintenances = true;
		let addError = "";

		// Delete confirmation
		let showDeleteDialog = false;

		let deletingSubscriber = null;
		let isDeleting = false;

		// Updating toggles
		let updatingToggle = {};

		// Fetch config
		async function fetchConfig() {
			loadingConfig = true;

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getSubscriptionsConfig" })
				});

				config = await res.json();
			} catch(error) {
				toast.error("Failed to load configuration");
			} finally {
				loadingConfig = false;
			}
		}

		// Save config
		async function saveConfig() {
			savingConfig = true;

			try {
				await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "updateSubscriptionsConfig", data: config })
				});

				toast.success("Configuration saved");
			} catch(error) {
				toast.error("Failed to save configuration");
			} finally {
				savingConfig = false;
			}
		}

		// Fetch subscribers
		async function fetchSubscribers() {
			loadingSubscribers = true;

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getAdminSubscribers", data: { page, limit } })
				});

				const result = await res.json();

				if (!result.error) {
					subscribers = result.subscribers || [];
					total = result.total || 0;
					totalPages = result.totalPages || 0;
				}
			} catch(error) {
				toast.error("Failed to load subscribers");
			} finally {
				loadingSubscribers = false;
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
			if (!newEmail.trim()) {
				addError = "Email is required";

				return;
			}

			addingSubscriber = true;
			addError = "";

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "adminAddSubscriber",
						data: {
							email: newEmail.trim(),
							incidents: newIncidents,
							maintenances: newMaintenances
						}
					})
				});

				const result = await res.json();

				if (result.error) {
					addError = result.error;
				} else {
					showAddDialog = false;
					resetAddForm();
					toast.success("Subscriber added successfully");
					await fetchSubscribers();
				}
			} catch(error) {
				addError = "Failed to add subscriber";
			} finally {
				addingSubscriber = false;
			}
		}

		function resetAddForm() {
			newEmail = "";
			newIncidents = true;
			newMaintenances = true;
			addError = "";
		}

		// Delete subscriber
		async function deleteSubscriber() {
			if (!deletingSubscriber) return;

			isDeleting = true;

			try {
				const res = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "adminDeleteSubscriber",
						data: { methodId: deletingSubscriber.method_id }
					})
				});

				const result = await res.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					showDeleteDialog = false;
					deletingSubscriber = null;
					toast.success("Subscriber deleted");
					await fetchSubscribers();
				}
			} catch(error) {
				toast.error("Failed to delete subscriber");
			} finally {
				isDeleting = false;
			}
		}

		function confirmDelete(subscriber) {
			deletingSubscriber = subscriber;
			showDeleteDialog = true;
		}

		function goToPage(newPage) {
			page = newPage;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container mx-auto space-y-6 py-6">`);

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
											class: 'flex items-center gap-2',
											children: ($$renderer) => {
												Bell($$renderer, { class: 'h-5 w-5' });
												$$renderer.push(`<!----> Subscriptions Settings`);
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
												$$renderer.push(`<!---->Configure subscription options for your status page`);
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
									if (pageData.data.canSendEmail === false) {
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

									$$renderer.push(`<!--]--> `);

									if (loadingConfig) {
										$$renderer.push(`<!--[0--><div class="flex justify-center py-10">`);
										Spinner($$renderer, {});
										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="space-y-6"><div class="flex items-center justify-between">`);

										Label($$renderer, {
											for: 'enable-subscriptions',
											class: 'mb-0',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Enable Subscriptions`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Switch($$renderer, {
											id: 'enable-subscriptions',
											checked: config.enable,
											onCheckedChange: (e) => {
												config.enable = e;
												config.methods.emails.incidents = e;
												config.methods.emails.maintenances = e;
												handleConfigChange();
											}
										});

										$$renderer.push(`<!----></div> `);

										if (config.enable) {
											$$renderer.push(`<!--[0--><div class="space-y-4 border-l-2 pl-4"><p class="flex items-center gap-2 text-sm font-semibold">`);
											Mail($$renderer, { class: 'h-4 w-4' });
											$$renderer.push(`<!----> Email Notifications</p> <div class="space-y-4 pl-4"><div class="flex items-center justify-between"><div class="flex items-center gap-2">`);
											AlertTriangle($$renderer, { class: 'h-4 w-4 text-orange-500' });
											$$renderer.push(`<!----> `);

											Label($$renderer, {
												for: 'enable-email-incidents',
												class: 'mb-0',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Incident Updates`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div> `);

											Switch($$renderer, {
												id: 'enable-email-incidents',
												checked: config.methods.emails.incidents,
												onCheckedChange: (e) => {
													config.methods.emails.incidents = e;
													handleConfigChange();
												}
											});

											$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="flex items-center gap-2">`);
											Wrench($$renderer, { class: 'h-4 w-4 text-blue-500' });
											$$renderer.push(`<!----> `);

											Label($$renderer, {
												for: 'enable-email-maintenances',
												class: 'mb-0',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Maintenance Updates`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div> `);

											Switch($$renderer, {
												id: 'enable-email-maintenances',
												checked: config.methods.emails.maintenances,
												onCheckedChange: (e) => {
													config.methods.emails.maintenances = e;
													handleConfigChange();
												}
											});

											$$renderer.push(`<!----></div></div></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <div class="space-y-4 border-l-2 pl-4"><p class="flex items-center gap-2 text-sm font-semibold">`);
										Rss($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> RSS Feed</p> <div class="space-y-4 pl-4"><div class="flex items-center justify-between"><div class="space-y-0.5">`);

										Label($$renderer, {
											for: 'enable-rss-feed',
											class: 'mb-0',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Show RSS feed link`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Adds an RSS icon to the public page header. The feed routes
                    (<code class="text-xs">/rss.xml</code>) remain reachable either way.</p></div> `);

										Switch($$renderer, {
											id: 'enable-rss-feed',
											checked: subMenuOptions.showRssFeed,
											disabled: savingRssToggle,
											onCheckedChange: toggleRssFeed
										});

										$$renderer.push(`<!----></div></div></div></div>`);
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

			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center justify-between"><div>`);

									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Subscribers`);
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
												$$renderer.push(`<!---->Manage email subscribers for notifications`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div> <div class="flex items-center gap-2">`);

									if (loadingSubscribers) {
										$$renderer.push('<!--[0-->');
										Spinner($$renderer, { class: 'size-5' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									Button($$renderer, {
										onclick: () => showAddDialog = true,
										children: ($$renderer) => {
											PlusIcon($$renderer, { class: 'h-4 w-4' });
											$$renderer.push(`<!----> Add Subscriber`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div>`);
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
									$$renderer.push(`<div class="ktable rounded-xl border">`);

									if (Table.Root) {
										$$renderer.push('<!--[-->');

										Table.Root($$renderer, {
											children: ($$renderer) => {
												if (Table.Header) {
													$$renderer.push('<!--[-->');

													Table.Header($$renderer, {
														children: ($$renderer) => {
															if (Table.Row) {
																$$renderer.push('<!--[-->');

																Table.Row($$renderer, {
																	children: ($$renderer) => {
																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
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

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				class: 'text-center',
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="flex items-center justify-center gap-1">`);
																					AlertTriangle($$renderer, { class: 'h-4 w-4 text-orange-500' });
																					$$renderer.push(`<!----> Incidents</div>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				class: 'text-center',
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="flex items-center justify-center gap-1">`);
																					Wrench($$renderer, { class: 'h-4 w-4 text-blue-500' });
																					$$renderer.push(`<!----> Maintenances</div>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Subscribed At`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Table.Head) {
																			$$renderer.push('<!--[-->');

																			Table.Head($$renderer, {
																				class: 'w-20 text-center',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Actions`);
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

												if (Table.Body) {
													$$renderer.push('<!--[-->');

													Table.Body($$renderer, {
														children: ($$renderer) => {
															if (loadingSubscribers && subscribers.length === 0) {
																$$renderer.push('<!--[0-->');

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					colspan: 5,
																					class: 'py-8 text-center',
																					children: ($$renderer) => {
																						$$renderer.push(`<div class="flex items-center justify-center gap-2">`);
																						Spinner($$renderer, { class: 'size-4' });
																						$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">Loading subscribers...</span></div>`);
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
															} else if (subscribers.length === 0) {
																$$renderer.push('<!--[1-->');

																if (Table.Row) {
																	$$renderer.push('<!--[-->');

																	Table.Row($$renderer, {
																		children: ($$renderer) => {
																			if (Table.Cell) {
																				$$renderer.push('<!--[-->');

																				Table.Cell($$renderer, {
																					colspan: 5,
																					class: 'text-muted-foreground py-8 text-center',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->No subscribers yet. Add your first subscriber above.`);
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
																$$renderer.push(`<!--[-1--><!--[-->`);

																const each_array = $.ensure_array_like(subscribers);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let subscriber = each_array[$$index];

																	if (Table.Row) {
																		$$renderer.push('<!--[-->');

																		Table.Row($$renderer, {
																			children: ($$renderer) => {
																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						class: 'font-medium',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(subscriber.email)}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						class: 'text-center',
																						children: ($$renderer) => {
																							Switch($$renderer, {
																								checked: subscriber.incidents_enabled,
																								disabled: updatingToggle[`${subscriber.method_id}-incidents`],
																								onCheckedChange: (e) => toggleSubscription(subscriber, "incidents", e)
																							});
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						class: 'text-center',
																						children: ($$renderer) => {
																							Switch($$renderer, {
																								checked: subscriber.maintenances_enabled,
																								disabled: updatingToggle[`${subscriber.method_id}-maintenances`],
																								onCheckedChange: (e) => toggleSubscription(subscriber, "maintenances", e)
																							});
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(format(new Date(subscriber.created_at), "MMM d, yyyy"))}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						class: 'text-center',
																						children: ($$renderer) => {
																							Button($$renderer, {
																								variant: 'ghost',
																								size: 'icon',
																								class: 'text-destructive hover:bg-destructive/10 h-8 w-8',
																								onclick: () => confirmDelete(subscriber),
																								children: ($$renderer) => {
																									Trash2Icon($$renderer, { class: 'h-4 w-4' });
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

																$$renderer.push(`<!--]-->`);
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

									$$renderer.push(`</div> `);

									if (total > 0) {
										$$renderer.push('<!--[0-->');

										const startItem = (page - 1) * limit + 1;
										const endItem = Math.min(page * limit, total);

										$$renderer.push(`<div class="mt-4 flex items-center justify-between"><span class="text-muted-foreground text-sm">Showing ${$.escape(startItem)}-${$.escape(endItem)} of ${$.escape(total)}</span> `);

										if (totalPages > 1) {
											$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);

											Button($$renderer, {
												variant: 'outline',
												size: 'icon',
												disabled: page === 1,
												onclick: () => goToPage(page - 1),
												children: ($$renderer) => {
													ChevronLeftIcon($$renderer, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="flex items-center gap-1"><!--[-->`);

											const each_array_1 = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let pageNum = each_array_1[$$index_1];

												if (pageNum === 1 || pageNum === totalPages || pageNum >= page - 1 && pageNum <= page + 1) {
													$$renderer.push('<!--[0-->');

													Button($$renderer, {
														variant: pageNum === page ? "default" : "ghost",
														size: 'sm',
														onclick: () => goToPage(pageNum),
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(pageNum)}`);
														},
														$$slots: { default: true }
													});
												} else if (pageNum === page - 2 || pageNum === page + 2) {
													$$renderer.push(`<!--[1--><span class="text-muted-foreground px-1">...</span>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]--></div> `);

											Button($$renderer, {
												variant: 'outline',
												size: 'icon',
												disabled: page === totalPages,
												onclick: () => goToPage(page + 1),
												children: ($$renderer) => {
													ChevronRightIcon($$renderer, { class: 'size-4' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return showAddDialog;
					},

					set open($$value) {
						showAddDialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-md',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Add Subscriber`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Add a new email subscriber for notifications`);
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

									$$renderer.push(` <div class="space-y-4 py-4"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'new-email',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Email Address`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'new-email',
										type: 'email',
										placeholder: 'subscriber@example.com',
										disabled: addingSubscriber,
										get value() {
											return newEmail;
										},

										set value($$value) {
											newEmail = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="space-y-4"><div class="flex items-center justify-between"><div class="flex items-center gap-2">`);
									AlertTriangle($$renderer, { class: 'h-4 w-4 text-orange-500' });
									$$renderer.push(`<!----> `);

									Label($$renderer, {
										for: 'new-incidents',
										class: 'mb-0',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Subscribe to Incidents`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> `);

									Switch($$renderer, {
										id: 'new-incidents',
										disabled: addingSubscriber,
										get checked() {
											return newIncidents;
										},

										set checked($$value) {
											newIncidents = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="flex items-center justify-between"><div class="flex items-center gap-2">`);
									Wrench($$renderer, { class: 'h-4 w-4 text-blue-500' });
									$$renderer.push(`<!----> `);

									Label($$renderer, {
										for: 'new-maintenances',
										class: 'mb-0',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Subscribe to Maintenances`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> `);

									Switch($$renderer, {
										id: 'new-maintenances',
										disabled: addingSubscriber,
										get checked() {
											return newMaintenances;
										},

										set checked($$value) {
											newMaintenances = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div></div> `);

									if (addError) {
										$$renderer.push('<!--[0-->');

										if (Alert.Root) {
											$$renderer.push('<!--[-->');

											Alert.Root($$renderer, {
												variant: 'destructive',
												children: ($$renderer) => {
													if (Alert.Description) {
														$$renderer.push('<!--[-->');

														Alert.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(addError)}`);
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

									$$renderer.push(`<!--]--></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: () => {
														showAddDialog = false;
														resetAddForm();
													},
													disabled: addingSubscriber,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													onclick: addSubscriber,
													disabled: addingSubscriber,
													children: ($$renderer) => {
														if (addingSubscriber) {
															$$renderer.push('<!--[0-->');
															Spinner($$renderer, { class: 'size-4' });
															$$renderer.push(`<!----> Adding...`);
														} else {
															$$renderer.push(`<!--[-1-->Add Subscriber`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return showDeleteDialog;
					},

					set open($$value) {
						showDeleteDialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-md',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete Subscriber`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure you want to delete this subscriber? This action cannot be undone.`);
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

									if (deletingSubscriber) {
										$$renderer.push(`<!--[0--><div class="py-4"><p class="text-sm"><span class="text-muted-foreground">Email:</span> <span class="font-medium">${$.escape(deletingSubscriber.email)}</span></p></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: () => {
														showDeleteDialog = false;
														deletingSubscriber = null;
													},
													disabled: isDeleting,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'destructive',
													onclick: deleteSubscriber,
													disabled: isDeleting,
													children: ($$renderer) => {
														if (isDeleting) {
															$$renderer.push('<!--[0-->');
															Spinner($$renderer, { class: 'size-4' });
															$$renderer.push(`<!----> Deleting...`);
														} else {
															$$renderer.push(`<!--[-1-->Delete`);
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