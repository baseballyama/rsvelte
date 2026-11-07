import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import PlusIcon from "@lucide/svelte/icons/plus";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import { toast } from "svelte-sonner";
import { onMount } from "svelte";
import SettingsIcon from "@lucide/svelte/icons/settings";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> New Trigger`, 1);
var root_3 = $.from_html(`<div class="text-muted-foreground py-8 text-center">No triggers found</div>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> Configure`, 1);
var root_6 = $.from_html(`<div class="ktable rounded-xl border"><!></div>`);
var root_7 = $.from_html(`<span class="text-muted-foreground px-1">...</span>`);
var root_8 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"></div> <!></div>`);
var root_9 = $.from_html(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm"> </span> <!></div>`);
var root_10 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><!> <!></div> <!></div> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Types
	// State
	let loading = $.state(true);

	let triggers = $.state($.proxy([]));
	let totalPages = $.state(0);
	let totalCount = $.state(0);
	let pageNo = $.state(1);
	let statusFilter = $.state("ACTIVE");
	const limit = 10;

	// Fetch triggers
	async function fetchData() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getTriggers",
					data: {
						status: $.get(statusFilter) === "ALL" ? undefined : $.get(statusFilter)
					}
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(triggers, result.map((t) => ({ ...t, testLoaders: "idle" })), true);
				$.set(totalCount, $.get(triggers).length, true);
				$.set(totalPages, Math.ceil($.get(totalCount) / limit), true);
			}
		} catch(error) {
			console.error("Error fetching triggers:", error);
			toast.error("Failed to load triggers");
		} finally {
			$.set(loading, false);
		}
	}

	function handleStatusChange(value) {
		if (value) {
			$.set(statusFilter, value, true);
			$.set(pageNo, 1);
			fetchData();
		}
	}

	function goToPage(page) {
		$.set(pageNo, page, true);
	}

	// Paginated triggers
	const paginatedTriggers = $.derived(() => $.get(triggers).slice(($.get(pageNo) - 1) * limit, $.get(pageNo) * limit));

	onMount(() => {
		fetchData();
	});

	var div = root_10();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(statusFilter);
			},
			onValueChange: handleStatusChange,
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'w-36',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(statusFilter) === "ALL" ? "All Status" : $.get(statusFilter)));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Select.Item, ($$anchor, Select_Item) => {
								Select_Item($$anchor, {
									value: 'ALL',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('All Status');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Select.Item, ($$anchor, Select_Item_1) => {
								Select_Item_1($$anchor, {
									value: 'ACTIVE',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Active');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Select.Item, ($$anchor, Select_Item_2) => {
								Select_Item_2($$anchor, {
									value: 'INACTIVE',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Inactive');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Spinner($$anchor, { class: 'size-5' });
		};

		$.if(node_6, ($$render) => {
			if ($.get(loading)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var node_7 = $.sibling(div_2, 2);

	{
		let $0 = $.derived(() => clientResolver(resolve, "/manage/app/triggers/new"));

		Button(node_7, {
			get href() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_2();
				var node_8 = $.first_child(fragment_4);

				PlusIcon(node_8, { class: 'size-4' });
				$.next();
				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);

	var node_9 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_3();

			$.append($$anchor, div_3);
		};

		var alternate = ($$anchor) => {
			var div_4 = root_6();
			var node_10 = $.child(div_4);

			$.component(node_10, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_11 = $.first_child(fragment_5);

						$.component(node_11, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_12 = $.first_child(fragment_6);

									$.component(node_12, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_4();
												var node_13 = $.first_child(fragment_7);

												$.component(node_13, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														class: 'w-[280px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Name');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														class: 'w-[140px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Type');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														class: 'w-[140px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Status');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_15, 2);

												$.component(node_16, () => Table.Head, ($$anchor, Table_Head_3) => {
													Table_Head_3($$anchor, { class: 'w-[160px] text-right' });
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_17 = $.sibling(node_11, 2);

						$.component(node_17, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_18 = $.first_child(fragment_8);

									$.each(node_18, 17, () => $.get(paginatedTriggers), (trigger) => trigger.id, ($$anchor, trigger) => {
										var fragment_9 = $.comment();
										var node_19 = $.first_child(fragment_9);

										$.component(node_19, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_4();
													var node_20 = $.first_child(fragment_10);

													$.component(node_20, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															class: 'font-medium',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text();

																$.template_effect(() => $.set_text(text_7, $.get(trigger).name));
																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_21 = $.sibling(node_20, 2);

													$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																Badge($$anchor, {
																	variant: 'outline',
																	class: 'capitalize',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text();

																		$.template_effect(() => $.set_text(text_8, $.get(trigger).trigger_type));
																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_21, 2);

													$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => $.get(trigger).trigger_status === "ACTIVE" ? "default" : "secondary");

																	Badge($$anchor, {
																		get variant() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text();

																			$.template_effect(() => $.set_text(text_9, $.get(trigger).trigger_status));
																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													$.component(node_23, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															class: 'text-right',
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => clientResolver(resolve, `/manage/app/triggers/${$.get(trigger).id}`));

																	Button($$anchor, {
																		variant: 'outline',
																		size: 'sm',
																		get href() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_17 = root_5();
																			var node_24 = $.first_child(fragment_17);

																			SettingsIcon(node_24, { class: 'mr-1 size-4' });
																			$.next();
																			$.append($$anchor, fragment_17);
																		},
																		$$slots: { default: true }
																	});
																}
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
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_9, ($$render) => {
			if ($.get(paginatedTriggers).length === 0 && !$.get(loading)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var node_25 = $.sibling(node_9, 2);

	{
		var consequent_5 = ($$anchor) => {
			const startItem = $.derived(() => ($.get(pageNo) - 1) * limit + 1);
			const endItem = $.derived(() => Math.min($.get(pageNo) * limit, $.get(totalCount)));
			var div_5 = root_9();
			var span = $.child(div_5);
			var text_10 = $.only_child(span);
			var node_26 = $.sibling(span, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_6 = root_8();
					var node_27 = $.child(div_6);

					{
						let $0 = $.derived(() => $.get(pageNo) === 1);

						Button(node_27, {
							variant: 'outline',
							size: 'icon',
							get disabled() {
								return $.get($0);
							},
							onclick: () => goToPage($.get(pageNo) - 1),
							children: ($$anchor, $$slotProps) => {
								ChevronLeftIcon($$anchor, { class: 'size-4' });
							},
							$$slots: { default: true }
						});
					}

					var div_7 = $.sibling(node_27, 2);

					$.each(div_7, 20, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), (page) => page, ($$anchor, page) => {
						var fragment_19 = $.comment();
						var node_28 = $.first_child(fragment_19);

						{
							var consequent_2 = ($$anchor) => {
								{
									let $0 = $.derived(() => page === $.get(pageNo) ? "default" : "ghost");

									Button($$anchor, {
										get variant() {
											return $.get($0);
										},
										size: 'sm',
										onclick: () => goToPage(page),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text();

											$.template_effect(() => $.set_text(text_11, page));
											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});
								}
							};

							var consequent_3 = ($$anchor) => {
								var span_1 = root_7();

								$.append($$anchor, span_1);
							};

							$.if(node_28, ($$render) => {
								if (page === 1 || page === $.get(totalPages) || page >= $.get(pageNo) - 1 && page <= $.get(pageNo) + 1) $$render(consequent_2); else if (page === $.get(pageNo) - 2 || page === $.get(pageNo) + 2) $$render(consequent_3, 1);
							});
						}

						$.append($$anchor, fragment_19);
					});

					$.reset(div_7);

					var node_29 = $.sibling(div_7, 2);

					{
						let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages));

						Button(node_29, {
							variant: 'outline',
							size: 'icon',
							get disabled() {
								return $.get($0);
							},
							onclick: () => goToPage($.get(pageNo) + 1),
							children: ($$anchor, $$slotProps) => {
								ChevronRightIcon($$anchor, { class: 'size-4' });
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				$.if(node_26, ($$render) => {
					if ($.get(totalPages) > 1) $$render(consequent_4);
				});
			}

			$.reset(div_5);
			$.template_effect(() => $.set_text(text_10, `Showing ${$.get(startItem) ?? ''}-${$.get(endItem) ?? ''} of ${$.get(totalCount) ?? ''}`));
			$.append($$anchor, div_5);
		};

		$.if(node_25, ($$render) => {
			if ($.get(totalCount) > limit) $$render(consequent_5);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}