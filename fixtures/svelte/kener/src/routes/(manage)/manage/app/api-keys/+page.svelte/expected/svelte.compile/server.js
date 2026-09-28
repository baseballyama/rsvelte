import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import Plus from "@lucide/svelte/icons/plus";
import Loader from "@lucide/svelte/icons/loader";
import Copy from "@lucide/svelte/icons/copy";
import Check from "@lucide/svelte/icons/check";
import KeyIcon from "@lucide/svelte/icons/key";
import Trash2 from "@lucide/svelte/icons/trash-2";
import { toast } from "svelte-sonner";
import { format } from "date-fns";
import { onMount } from "svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { page } from "$app/state";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// State
		let apiKeys = [];

		let loading = true;
		let creating = false;
		let showCreateDialog = false;
		let newAPIKeyName = "";
		let newKeyResp = {};
		let copied = false;
		let deleteDialogOpen = false;
		let keyToDelete = null;
		let deleting = false;

		async function loadAPIKeys() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getAPIKeys", data: {} })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					apiKeys = result;
				}
			} catch(e) {
				toast.error("Failed to load API keys");
			} finally {
				loading = false;
			}
		}

		async function createNewAPIKey() {
			if (!newAPIKeyName.trim()) {
				toast.error("Please enter a name for the API key");

				return;
			}

			creating = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "createNewApiKey", data: { name: newAPIKeyName } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					newKeyResp = result;
					toast.success("API key created successfully");
					loadAPIKeys();
					showCreateDialog = false;
					newAPIKeyName = "";
				}
			} catch(e) {
				toast.error("Failed to create API key");
			} finally {
				creating = false;
			}
		}

		async function updateStatus(apiKey) {
			const newStatus = apiKey.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updateApiKeyStatus",
						data: { id: apiKey.id, status: newStatus }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					apiKey.status = newStatus;
					apiKeys = [...apiKeys];
					toast.success(`API key ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
				}
			} catch(e) {
				toast.error("Failed to update API key status");
			}
		}

		function openDeleteDialog(apiKey) {
			keyToDelete = apiKey;
			deleteDialogOpen = true;
		}

		async function deleteApiKey() {
			if (!keyToDelete) return;

			deleting = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "deleteApiKey", data: { id: keyToDelete.id } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("API key deleted successfully");
					await loadAPIKeys();
				}
			} catch(e) {
				toast.error("Failed to delete API key");
			} finally {
				deleting = false;
				deleteDialogOpen = false;
				keyToDelete = null;
			}
		}

		function copyKey() {
			if (newKeyResp.apiKey) {
				navigator.clipboard.writeText(newKeyResp.apiKey);
				copied = true;
				toast.success("API key copied to clipboard");

				setTimeout(
					() => {
						copied = false;
					},
					2000
				);
			}
		}

		function formatDate(dateStr) {
			try {
				return format(new Date(dateStr), "MMM d, yyyy HH:mm");
			} catch {
				return dateStr;
			}
		}

		function dismissNewKey() {
			newKeyResp = {};
		}

		onMount(() => {
			loadAPIKeys();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-4 p-4"><div class="flex items-center justify-end">`);

			Button($$renderer, {
				onclick: () => showCreateDialog = true,
				children: ($$renderer) => {
					Plus($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----> Create New API Key`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (newKeyResp.apiKey) {
				$$renderer.push('<!--[0-->');

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						class: 'border-green-600 bg-green-50 dark:bg-green-950/20',
						children: ($$renderer) => {
							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: '',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-start gap-3"><div class="flex-1"><p class="font-medium text-green-800 dark:text-green-200">🎉 API Key Created Successfully</p> <div class="relative mt-2"><code class="bg-background block rounded-md border px-4 py-2 pr-12 font-mono text-sm">${$.escape(newKeyResp.apiKey)}</code> `);

										Button($$renderer, {
											size: 'icon',
											variant: 'ghost',
											class: 'absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2',
											onclick: copyKey,
											children: ($$renderer) => {
												if (copied) {
													$$renderer.push('<!--[0-->');
													Check($$renderer, { class: 'h-4 w-4 text-green-500' });
												} else {
													$$renderer.push('<!--[-1-->');
													Copy($$renderer, { class: 'h-4 w-4' });
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-2 text-xs">Your new API key has been created. It will <strong class="uppercase underline">not be shown again</strong>, so make sure to save it.</p></div> `);

										Button($$renderer, {
											size: 'sm',
											variant: 'ghost',
											onclick: dismissNewKey,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Dismiss`);
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

			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'p-0',
								children: ($$renderer) => {
									if (loading) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
										Spinner($$renderer, { class: 'h-6 w-6' });
										$$renderer.push(`<!----></div>`);
									} else if (apiKeys.length === 0) {
										$$renderer.push(`<!--[1--><div class="text-muted-foreground py-12 text-center">`);
										KeyIcon($$renderer, { class: 'mx-auto mb-4 h-12 w-12 opacity-50' });
										$$renderer.push(`<!----> <p>No API keys found</p> <p class="text-sm">Create your first API key to get started</p></div>`);
									} else {
										$$renderer.push('<!--[-1-->');

										if (Table.Root) {
											$$renderer.push('<!--[-->');

											Table.Root($$renderer, {
												class: 'p-4',
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
																					class: 'pl-4',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Name`);
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
																						$$renderer.push(`<!---->Key`);
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
																						$$renderer.push(`<!---->Created At`);
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
																					class: 'pr-4 text-right',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Status`);
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
																					class: 'pr-4 text-right',
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
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(apiKeys);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let apiKey = each_array[$$index];

																	if (Table.Row) {
																		$$renderer.push('<!--[-->');

																		Table.Row($$renderer, {
																			children: ($$renderer) => {
																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						class: 'pl-4 font-medium',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(apiKey.name)}`);
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
																							$$renderer.push(`<code class="text-muted-foreground text-xs">${$.escape(apiKey.masked_key.slice(-32))}</code>`);
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
																						class: 'text-muted-foreground text-sm',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(formatDate(apiKey.created_at))}`);
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
																						class: 'pr-4 text-right',
																						children: ($$renderer) => {
																							$$renderer.push(`<div class="flex items-center justify-end gap-2"><span class="text-muted-foreground text-xs">${$.escape(apiKey.status === "ACTIVE" ? "Active" : "Inactive")}</span> `);

																							Switch($$renderer, {
																								checked: apiKey.status === "ACTIVE",
																								onCheckedChange: () => updateStatus(apiKey)
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

																				if (Table.Cell) {
																					$$renderer.push('<!--[-->');

																					Table.Cell($$renderer, {
																						class: 'pr-4 text-right',
																						children: ($$renderer) => {
																							Button($$renderer, {
																								variant: 'destructive',
																								disabled: !page.data.userPermissions?.includes("api_keys.delete"),
																								size: 'sm',
																								onclick: () => openDeleteDialog(apiKey),
																								children: ($$renderer) => {
																									Trash2($$renderer, { class: 'h-4 w-4' });
																									$$renderer.push(`<!----> Delete`);
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
						return showCreateDialog;
					},

					set open($$value) {
						showCreateDialog = $$value;
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
															$$renderer.push(`<!---->Create a new API Key`);
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
															$$renderer.push(`<!---->API keys are used to authenticate your requests to the API. They are unique to your account and should be kept
        secret.`);
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

									$$renderer.push(` <form><div class="grid gap-4 py-4"><div class="grid gap-2">`);

									Label($$renderer, {
										for: 'newAPIKeyName',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'newAPIKeyName',
										placeholder: 'eg. My API Key',
										required: true,
										get value() {
											return newAPIKeyName;
										},

										set value($$value) {
											newAPIKeyName = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => showCreateDialog = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													disabled: creating,
													children: ($$renderer) => {
														if (creating) {
															$$renderer.push('<!--[0-->');
															Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> Create`);
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

									$$renderer.push(`</form>`);
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
															$$renderer.push(`<!---->Delete API Key`);
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
															$$renderer.push(`<!---->Are you sure you want to delete API key "${$.escape(keyToDelete?.name)}"? This action cannot be undone.`);
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

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														disabled: deleting,
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

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: deleteApiKey,
														disabled: deleting,
														children: ($$renderer) => {
															if (deleting) {
																$$renderer.push('<!--[0-->');
																Spinner($$renderer, { class: 'h-4 w-4' });
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> Delete`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}