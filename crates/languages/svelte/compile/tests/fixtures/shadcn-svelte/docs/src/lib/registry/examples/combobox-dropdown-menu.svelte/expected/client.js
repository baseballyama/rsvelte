import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import TagsIcon from "@lucide/svelte/icons/tags";
import TrashIcon from "@lucide/svelte/icons/trash";
import UserIcon from "@lucide/svelte/icons/user";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> Assign to...`, 1);
var root_1 = $.from_html(`<!> Set due date...`, 1);
var root_2 = $.from_html(`<!> Apply label`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> Delete <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex w-full flex-col items-start justify-between rounded-md border px-4 py-3 sm:flex-row sm:items-center"><p class="text-sm leading-none font-medium"><span class="me-2 rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground"> </span> <span class="text-muted-foreground">Create a new project</span></p> <!></div>`);

export default function Combobox_dropdown_menu($$anchor, $$props) {
	$.push($$props, true);

	const labels = [
		"feature",
		"bug",
		"enhancement",
		"documentation",
		"design",
		"question",
		"maintenance"
	];

	let open = $.state(false);
	let selectedLabel = $.state("feature");
	let triggerRef = $.state(null);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		$.set(open, false);

		tick().then(() => {
			$.get(triggerRef).focus();
		});
	}

	var div = root_6();
	var p = $.child(div);
	var span = $.child(p);
	var text = $.only_child(span, true);

	$.next(2);
	$.reset(p);

	var node = $.sibling(p, 2);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props({ variant: 'ghost', size: 'sm' }, props, {
							'aria-label': 'Open menu',
							children: ($$anchor, $$slotProps) => {
								EllipsisIcon($$anchor, {});
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get ref() {
								return $.get(triggerRef);
							},

							set ref($$value) {
								$.set(triggerRef, $$value, true);
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'w-[200px]',
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_5();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
											DropdownMenu_Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Actions');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_6 = $.first_child(fragment_5);

													UserIcon(node_6, { class: 'me-2 size-4' });
													$.next();
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_5, 2);

										$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_8 = $.first_child(fragment_6);

													CalendarIcon(node_8, { class: 'me-2 size-4' });
													$.next();
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
											DropdownMenu_Separator($$anchor, {});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
											DropdownMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_3();
													var node_11 = $.first_child(fragment_7);

													$.component(node_11, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
														DropdownMenu_SubTrigger($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_2();
																var node_12 = $.first_child(fragment_8);

																TagsIcon(node_12, { class: 'me-2 size-4' });
																$.next();
																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_13 = $.sibling(node_11, 2);

													$.component(node_13, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
														DropdownMenu_SubContent($$anchor, {
															class: 'p-0',
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_14 = $.first_child(fragment_9);

																$.component(node_14, () => Command.Root, ($$anchor, Command_Root) => {
																	Command_Root($$anchor, {
																		get value() {
																			return $.get(selectedLabel);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_3();
																			var node_15 = $.first_child(fragment_10);

																			$.component(node_15, () => Command.Input, ($$anchor, Command_Input) => {
																				Command_Input($$anchor, { autofocus: true, placeholder: 'Filter label...' });
																			});

																			var node_16 = $.sibling(node_15, 2);

																			$.component(node_16, () => Command.List, ($$anchor, Command_List) => {
																				Command_List($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = root_3();
																						var node_17 = $.first_child(fragment_11);

																						$.component(node_17, () => Command.Empty, ($$anchor, Command_Empty) => {
																							Command_Empty($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_2 = $.text('No label found.');

																									$.append($$anchor, text_2);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_18 = $.sibling(node_17, 2);

																						$.component(node_18, () => Command.Group, ($$anchor, Command_Group) => {
																							Command_Group($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_12 = $.comment();
																									var node_19 = $.first_child(fragment_12);

																									$.each(node_19, 16, () => labels, (label) => label, ($$anchor, label) => {
																										var fragment_13 = $.comment();
																										var node_20 = $.first_child(fragment_13);

																										$.component(node_20, () => Command.Item, ($$anchor, Command_Item) => {
																											Command_Item($$anchor, {
																												get value() {
																													return label;
																												},

																												onSelect: () => {
																													$.set(selectedLabel, label, true);
																													closeAndFocusTrigger();
																												},

																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_3 = $.text();

																													$.template_effect(() => $.set_text(text_3, label));
																													$.append($$anchor, text_3);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_13);
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

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_10, 2);

										$.component(node_21, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
											DropdownMenu_Separator_1($$anchor, {});
										});

										var node_22 = $.sibling(node_21, 2);

										$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												class: 'text-red-600',
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_4();
													var node_23 = $.first_child(fragment_15);

													TrashIcon(node_23, { class: 'me-2 size-4' });

													var node_24 = $.sibling(node_23, 2);

													$.component(node_24, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
														DropdownMenu_Shortcut($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('⌘⌫');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(selectedLabel)));
	$.append($$anchor, div);
	$.pop();
}