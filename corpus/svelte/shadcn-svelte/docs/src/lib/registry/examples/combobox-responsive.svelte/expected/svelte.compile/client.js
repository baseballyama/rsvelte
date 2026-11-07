import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import { onMount } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="mt-4 border-t"><!></div>`);

export default function Combobox_responsive($$anchor, $$props) {
	$.push($$props, true);

	const statuses = [
		{ value: "backlog", label: "Backlog" },
		{ value: "todo", label: "Todo" },
		{ value: "in progress", label: "In Progress" },
		{ value: "done", label: "Done" },
		{ value: "canceled", label: "Canceled" }
	];

	let open = $.state(false);
	let selectedStatus = $.state(null);
	let isDesktop = $.state(false);

	function checkScreenSize() {
		$.set(isDesktop, window.innerWidth >= 768);
	}

	onMount(() => {
		if (browser) {
			checkScreenSize();
			window.addEventListener("resize", checkScreenSize);

			return () => window.removeEventListener("resize", checkScreenSize);
		}
	});

	function handleStatusSelect(value) {
		$.set(selectedStatus, statuses.find((status) => status.value === value) || null, true);
		$.set(open, false);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
							Popover_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'outline',
										class: 'w-[150px] justify-start',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(selectedStatus) ? $.get(selectedStatus).label : "+ Set status"));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-[200px] p-0',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_5 = $.first_child(fragment_6);

												$.component(node_5, () => Command.Input, ($$anchor, Command_Input) => {
													Command_Input($$anchor, { placeholder: 'Filter status...' });
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_7 = $.first_child(fragment_7);

															$.component(node_7, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('No results found.');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Command.Group, ($$anchor, Command_Group) => {
																Command_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = $.comment();
																		var node_9 = $.first_child(fragment_8);

																		$.each(node_9, 17, () => statuses, (status) => status.value, ($$anchor, status) => {
																			var fragment_9 = $.comment();
																			var node_10 = $.first_child(fragment_9);

																			$.component(node_10, () => Command.Item, ($$anchor, Command_Item) => {
																				Command_Item($$anchor, {
																					get value() {
																						return $.get(status).value;
																					},
																					onSelect: () => handleStatusSelect($.get(status).value),
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text();

																						$.template_effect(() => $.set_text(text_2, $.get(status).label));
																						$.append($$anchor, text_2);
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

									$.append($$anchor, fragment_5);
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
		};

		var alternate = ($$anchor) => {
			var fragment_11 = $.comment();
			var node_11 = $.first_child(fragment_11);

			$.component(node_11, () => Drawer.Root, ($$anchor, Drawer_Root) => {
				Drawer_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_12 = root();
						var node_12 = $.first_child(fragment_12);

						$.component(node_12, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
							Drawer_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'outline',
										class: 'w-[150px] justify-start',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, $.get(selectedStatus) ? $.get(selectedStatus).label : "+ Set status"));
											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_12, 2);

						$.component(node_13, () => Drawer.Content, ($$anchor, Drawer_Content) => {
							Drawer_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div = root_1();
									var node_14 = $.child(div);

									$.component(node_14, () => Command.Root, ($$anchor, Command_Root_1) => {
										Command_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = root();
												var node_15 = $.first_child(fragment_15);

												$.component(node_15, () => Command.Input, ($$anchor, Command_Input_1) => {
													Command_Input_1($$anchor, { placeholder: 'Filter status...' });
												});

												var node_16 = $.sibling(node_15, 2);

												$.component(node_16, () => Command.List, ($$anchor, Command_List_1) => {
													Command_List_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_16 = root();
															var node_17 = $.first_child(fragment_16);

															$.component(node_17, () => Command.Empty, ($$anchor, Command_Empty_1) => {
																Command_Empty_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('No results found.');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_18 = $.sibling(node_17, 2);

															$.component(node_18, () => Command.Group, ($$anchor, Command_Group_1) => {
																Command_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_17 = $.comment();
																		var node_19 = $.first_child(fragment_17);

																		$.each(node_19, 17, () => statuses, (status) => status.value, ($$anchor, status) => {
																			var fragment_18 = $.comment();
																			var node_20 = $.first_child(fragment_18);

																			$.component(node_20, () => Command.Item, ($$anchor, Command_Item_1) => {
																				Command_Item_1($$anchor, {
																					get value() {
																						return $.get(status).value;
																					},
																					onSelect: () => handleStatusSelect($.get(status).value),
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text();

																						$.template_effect(() => $.set_text(text_5, $.get(status).label));
																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_18);
																		});

																		$.append($$anchor, fragment_17);
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
											},
											$$slots: { default: true }
										});
									});

									$.reset(div);
									$.append($$anchor, div);
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
		};

		$.if(node, ($$render) => {
			if ($.get(isDesktop)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}