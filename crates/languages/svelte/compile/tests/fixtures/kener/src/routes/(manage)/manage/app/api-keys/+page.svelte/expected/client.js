import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> Create New API Key`, 1);
var root_1 = $.from_html(`<div class="flex items-start gap-3"><div class="flex-1"><p class="font-medium text-green-800 dark:text-green-200">🎉 API Key Created Successfully</p> <div class="relative mt-2"><code class="bg-background block rounded-md border px-4 py-2 pr-12 font-mono text-sm"> </code> <!></div> <p class="text-muted-foreground mt-2 text-xs">Your new API key has been created. It will <strong class="uppercase underline">not be shown again</strong>, so make sure to save it.</p></div> <!></div>`);
var root_2 = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_3 = $.from_html(`<div class="text-muted-foreground py-12 text-center"><!> <p>No API keys found</p> <p class="text-sm">Create your first API key to get started</p></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<code class="text-muted-foreground text-xs"> </code>`);
var root_6 = $.from_html(`<div class="flex items-center justify-end gap-2"><span class="text-muted-foreground text-xs"> </span> <!></div>`);
var root_7 = $.from_html(`<!> Delete`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<!> Create`, 1);
var root_10 = $.from_html(`<!> <form><div class="grid gap-4 py-4"><div class="grid gap-2"><!> <!></div></div> <!></form>`, 1);
var root_11 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><div class="flex items-center justify-end"><!></div> <!> <!></div> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// State
	let apiKeys = $.state($.proxy([]));

	let loading = $.state(true);
	let creating = $.state(false);
	let showCreateDialog = $.state(false);
	let newAPIKeyName = $.state("");
	let newKeyResp = $.state($.proxy({}));
	let copied = $.state(false);
	let deleteDialogOpen = $.state(false);
	let keyToDelete = $.state(null);
	let deleting = $.state(false);

	async function loadAPIKeys() {
		$.set(loading, true);

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
				$.set(apiKeys, result, true);
			}
		} catch(e) {
			toast.error("Failed to load API keys");
		} finally {
			$.set(loading, false);
		}
	}

	async function createNewAPIKey() {
		if (!$.get(newAPIKeyName).trim()) {
			toast.error("Please enter a name for the API key");

			return;
		}

		$.set(creating, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "createNewApiKey",
					data: { name: $.get(newAPIKeyName) }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.set(newKeyResp, result, true);
				toast.success("API key created successfully");
				loadAPIKeys();
				$.set(showCreateDialog, false);
				$.set(newAPIKeyName, "");
			}
		} catch(e) {
			toast.error("Failed to create API key");
		} finally {
			$.set(creating, false);
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
				$.set(apiKeys, [...$.get(apiKeys)], true);
				toast.success(`API key ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
			}
		} catch(e) {
			toast.error("Failed to update API key status");
		}
	}

	function openDeleteDialog(apiKey) {
		$.set(keyToDelete, apiKey, true);
		$.set(deleteDialogOpen, true);
	}

	async function deleteApiKey() {
		if (!$.get(keyToDelete)) return;

		$.set(deleting, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "deleteApiKey", data: { id: $.get(keyToDelete).id } })
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
			$.set(deleting, false);
			$.set(deleteDialogOpen, false);
			$.set(keyToDelete, null);
		}
	}

	function copyKey() {
		if ($.get(newKeyResp).apiKey) {
			navigator.clipboard.writeText($.get(newKeyResp).apiKey);
			$.set(copied, true);
			toast.success("API key copied to clipboard");

			setTimeout(
				() => {
					$.set(copied, false);
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
		$.set(newKeyResp, {}, true);
	}

	onMount(() => {
		loadAPIKeys();
	});

	var fragment = root_11();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		onclick: () => $.set(showCreateDialog, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Plus(node_1, { class: 'h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.component(node_3, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'border-green-600 bg-green-50 dark:bg-green-950/20',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: '',
								children: ($$anchor, $$slotProps) => {
									var div_2 = root_1();
									var div_3 = $.child(div_2);
									var div_4 = $.sibling($.child(div_3), 2);
									var code = $.child(div_4);
									var text = $.only_child(code, true);
									var node_5 = $.sibling(code, 2);

									Button(node_5, {
										size: 'icon',
										variant: 'ghost',
										class: 'absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2',
										onclick: copyKey,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_6 = $.first_child(fragment_4);

											{
												var consequent = ($$anchor) => {
													Check($$anchor, { class: 'h-4 w-4 text-green-500' });
												};

												var alternate = ($$anchor) => {
													Copy($$anchor, { class: 'h-4 w-4' });
												};

												$.if(node_6, ($$render) => {
													if ($.get(copied)) $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									$.reset(div_4);
									$.next(2);
									$.reset(div_3);

									var node_7 = $.sibling(div_3, 2);

									Button(node_7, {
										size: 'sm',
										variant: 'ghost',
										onclick: dismissNewKey,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Dismiss');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.reset(div_2);
									$.template_effect(() => $.set_text(text, $.get(newKeyResp).apiKey));
									$.append($$anchor, div_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(newKeyResp).apiKey) $$render(consequent_1);
		});
	}

	var node_8 = $.sibling(node_2, 2);

	$.component(node_8, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_9 = $.first_child(fragment_7);

				$.component(node_9, () => Card.Content, ($$anchor, Card_Content_1) => {
					Card_Content_1($$anchor, {
						class: 'p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_10 = $.first_child(fragment_8);

							{
								var consequent_2 = ($$anchor) => {
									var div_5 = root_2();
									var node_11 = $.child(div_5);

									Spinner(node_11, { class: 'h-6 w-6' });
									$.reset(div_5);
									$.append($$anchor, div_5);
								};

								var consequent_3 = ($$anchor) => {
									var div_6 = root_3();
									var node_12 = $.child(div_6);

									KeyIcon(node_12, { class: 'mx-auto mb-4 h-12 w-12 opacity-50' });
									$.next(4);
									$.reset(div_6);
									$.append($$anchor, div_6);
								};

								var alternate_1 = ($$anchor) => {
									var fragment_9 = $.comment();
									var node_13 = $.first_child(fragment_9);

									$.component(node_13, () => Table.Root, ($$anchor, Table_Root) => {
										Table_Root($$anchor, {
											class: 'p-4',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_8();
												var node_14 = $.first_child(fragment_10);

												$.component(node_14, () => Table.Header, ($$anchor, Table_Header) => {
													Table_Header($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_15 = $.first_child(fragment_11);

															$.component(node_15, () => Table.Row, ($$anchor, Table_Row) => {
																Table_Row($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = root_4();
																		var node_16 = $.first_child(fragment_12);

																		$.component(node_16, () => Table.Head, ($$anchor, Table_Head) => {
																			Table_Head($$anchor, {
																				class: 'pl-4',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('Name');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_17 = $.sibling(node_16, 2);

																		$.component(node_17, () => Table.Head, ($$anchor, Table_Head_1) => {
																			Table_Head_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('Key');

																					$.append($$anchor, text_3);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_18 = $.sibling(node_17, 2);

																		$.component(node_18, () => Table.Head, ($$anchor, Table_Head_2) => {
																			Table_Head_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('Created At');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_19 = $.sibling(node_18, 2);

																		$.component(node_19, () => Table.Head, ($$anchor, Table_Head_3) => {
																			Table_Head_3($$anchor, {
																				class: 'pr-4 text-right',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('Status');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_20 = $.sibling(node_19, 2);

																		$.component(node_20, () => Table.Head, ($$anchor, Table_Head_4) => {
																			Table_Head_4($$anchor, {
																				class: 'pr-4 text-right',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('Actions');

																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_12);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_21 = $.sibling(node_14, 2);

												$.component(node_21, () => Table.Body, ($$anchor, Table_Body) => {
													Table_Body($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = $.comment();
															var node_22 = $.first_child(fragment_13);

															$.each(node_22, 17, () => $.get(apiKeys), (apiKey) => apiKey.id, ($$anchor, apiKey) => {
																var fragment_14 = $.comment();
																var node_23 = $.first_child(fragment_14);

																$.component(node_23, () => Table.Row, ($$anchor, Table_Row_1) => {
																	Table_Row_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = root_4();
																			var node_24 = $.first_child(fragment_15);

																			$.component(node_24, () => Table.Cell, ($$anchor, Table_Cell) => {
																				Table_Cell($$anchor, {
																					class: 'pl-4 font-medium',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_7 = $.text();

																						$.template_effect(() => $.set_text(text_7, $.get(apiKey).name));
																						$.append($$anchor, text_7);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_25 = $.sibling(node_24, 2);

																			$.component(node_25, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																				Table_Cell_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var code_1 = root_5();
																						var text_8 = $.only_child(code_1, true);

																						$.template_effect(($0) => $.set_text(text_8, $0), [() => $.get(apiKey).masked_key.slice(-32)]);
																						$.append($$anchor, code_1);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_26 = $.sibling(node_25, 2);

																			$.component(node_26, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																				Table_Cell_2($$anchor, {
																					class: 'text-muted-foreground text-sm',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text();

																						$.template_effect(($0) => $.set_text(text_9, $0), [() => formatDate($.get(apiKey).created_at)]);
																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_27 = $.sibling(node_26, 2);

																			$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																				Table_Cell_3($$anchor, {
																					class: 'pr-4 text-right',
																					children: ($$anchor, $$slotProps) => {
																						var div_7 = root_6();
																						var span = $.child(div_7);
																						var text_10 = $.only_child(span, true);
																						var node_28 = $.sibling(span, 2);

																						{
																							let $0 = $.derived(() => $.get(apiKey).status === "ACTIVE");

																							Switch(node_28, {
																								get checked() {
																									return $.get($0);
																								},
																								onCheckedChange: () => updateStatus($.get(apiKey))
																							});
																						}

																						$.reset(div_7);
																						$.template_effect(() => $.set_text(text_10, $.get(apiKey).status === "ACTIVE" ? "Active" : "Inactive"));
																						$.append($$anchor, div_7);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_29 = $.sibling(node_27, 2);

																			$.component(node_29, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																				Table_Cell_4($$anchor, {
																					class: 'pr-4 text-right',
																					children: ($$anchor, $$slotProps) => {
																						{
																							let $0 = $.derived(() => !page.data.userPermissions?.includes("api_keys.delete"));

																							Button($$anchor, {
																								variant: 'destructive',
																								get disabled() {
																									return $.get($0);
																								},
																								size: 'sm',
																								onclick: () => openDeleteDialog($.get(apiKey)),
																								children: ($$anchor, $$slotProps) => {
																									var fragment_19 = root_7();
																									var node_30 = $.first_child(fragment_19);

																									Trash2(node_30, { class: 'h-4 w-4' });
																									$.next();
																									$.append($$anchor, fragment_19);
																								},
																								$$slots: { default: true }
																							});
																						}
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_15);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_14);
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								};

								$.if(node_10, ($$render) => {
									if ($.get(loading)) $$render(consequent_2); else if ($.get(apiKeys).length === 0) $$render(consequent_3, 1); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_8);
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

	var node_31 = $.sibling(div, 2);

	$.component(node_31, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(showCreateDialog);
			},

			set open($$value) {
				$.set(showCreateDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_20 = $.comment();
				var node_32 = $.first_child(fragment_20);

				$.component(node_32, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-md',
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_10();
							var node_33 = $.first_child(fragment_21);

							$.component(node_33, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root_8();
										var node_34 = $.first_child(fragment_22);

										$.component(node_34, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Create a new API Key');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});
										});

										var node_35 = $.sibling(node_34, 2);

										$.component(node_35, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_12 = $.text('API keys are used to authenticate your requests to the API. They are unique to your account and should be kept\n        secret.');

													$.append($$anchor, text_12);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_22);
									},
									$$slots: { default: true }
								});
							});

							var form = $.sibling(node_33, 2);
							var div_8 = $.child(form);
							var div_9 = $.child(div_8);
							var node_36 = $.child(div_9);

							Label(node_36, {
								for: 'newAPIKeyName',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Name');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_37 = $.sibling(node_36, 2);

							Input(node_37, {
								id: 'newAPIKeyName',
								placeholder: 'eg. My API Key',
								required: true,
								get value() {
									return $.get(newAPIKeyName);
								},

								set value($$value) {
									$.set(newAPIKeyName, $$value, true);
								}
							});

							$.reset(div_9);
							$.reset(div_8);

							var node_38 = $.sibling(div_8, 2);

							$.component(node_38, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_23 = root_8();
										var node_39 = $.first_child(fragment_23);

										Button(node_39, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(showCreateDialog, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Cancel');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});

										var node_40 = $.sibling(node_39, 2);

										Button(node_40, {
											type: 'submit',
											get disabled() {
												return $.get(creating);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_24 = root_9();
												var node_41 = $.first_child(fragment_24);

												{
													var consequent_4 = ($$anchor) => {
														Loader($$anchor, { class: 'h-4 w-4 animate-spin' });
													};

													$.if(node_41, ($$render) => {
														if ($.get(creating)) $$render(consequent_4);
													});
												}

												$.next();
												$.append($$anchor, fragment_24);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_23);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);

							$.event('submit', form, (e) => {
								e.preventDefault();
								createNewAPIKey();
							});

							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_20);
			},
			$$slots: { default: true }
		});
	});

	var node_42 = $.sibling(node_31, 2);

	$.component(node_42, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(deleteDialogOpen);
			},

			set open($$value) {
				$.set(deleteDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_26 = $.comment();
				var node_43 = $.first_child(fragment_26);

				$.component(node_43, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_27 = root_8();
							var node_44 = $.first_child(fragment_27);

							$.component(node_44, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_28 = root_8();
										var node_45 = $.first_child(fragment_28);

										$.component(node_45, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Delete API Key');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										});

										var node_46 = $.sibling(node_45, 2);

										$.component(node_46, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text();

													$.template_effect(() => $.set_text(text_16, `Are you sure you want to delete API key "${$.get(keyToDelete)?.name ?? ''}"? This action cannot be undone.`));
													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_28);
									},
									$$slots: { default: true }
								});
							});

							var node_47 = $.sibling(node_44, 2);

							$.component(node_47, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_30 = root_8();
										var node_48 = $.first_child(fragment_30);

										$.component(node_48, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												get disabled() {
													return $.get(deleting);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Cancel');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										});

										var node_49 = $.sibling(node_48, 2);

										$.component(node_49, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: deleteApiKey,
												get disabled() {
													return $.get(deleting);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_31 = root_7();
													var node_50 = $.first_child(fragment_31);

													{
														var consequent_5 = ($$anchor) => {
															Spinner($$anchor, { class: 'h-4 w-4' });
														};

														$.if(node_50, ($$render) => {
															if ($.get(deleting)) $$render(consequent_5);
														});
													}

													$.next();
													$.append($$anchor, fragment_31);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_30);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_27);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_26);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}