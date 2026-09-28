import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalculatorIcon from "@lucide/svelte/icons/calculator";
import CalendarIcon from "@lucide/svelte/icons/calendar";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import SettingsIcon from "@lucide/svelte/icons/settings";
import SmileIcon from "@lucide/svelte/icons/smile";
import UserIcon from "@lucide/svelte/icons/user";
import * as Command from "$lib/registry/ui/command/index.js";

var root = $.from_html(`<!> <span>Calendar</span>`, 1);
var root_1 = $.from_html(`<!> <span>Search Emoji</span>`, 1);
var root_2 = $.from_html(`<!> <span>Calculator</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <span>Profile</span> <!>`, 1);
var root_5 = $.from_html(`<!> <span>Billing</span> <!>`, 1);
var root_6 = $.from_html(`<!> <span>Settings</span> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<p class="text-sm text-muted-foreground">Press <kbd class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 select-none"><span class="text-xs">⌘</span>J</kbd></p> <!>`, 1);

export default function Command_dialog($$anchor) {
	let open = $.state(false);

	function handleKeydown(e) {
		if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			$.set(open, !$.get(open));
		}
	}

	var fragment = root_9();

	$.event('keydown', $.document, handleKeydown);

	var node = $.sibling($.first_child(fragment), 2);

	$.component(node, () => Command.Dialog, ($$anchor, Command_Dialog) => {
		Command_Dialog($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_8();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, { placeholder: 'Type a command or search...' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_7();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Command.Empty, ($$anchor, Command_Empty) => {
								Command_Empty($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No results found.');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Command.Group, ($$anchor, Command_Group) => {
								Command_Group($$anchor, {
									heading: 'Suggestions',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Command.Item, ($$anchor, Command_Item) => {
											Command_Item($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_6 = $.first_child(fragment_4);

													CalendarIcon(node_6, { class: 'me-2 size-4' });
													$.next(2);
													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_5, 2);

										$.component(node_7, () => Command.Item, ($$anchor, Command_Item_1) => {
											Command_Item_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_8 = $.first_child(fragment_5);

													SmileIcon(node_8, { class: 'me-2 size-4' });
													$.next(2);
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => Command.Item, ($$anchor, Command_Item_2) => {
											Command_Item_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_10 = $.first_child(fragment_6);

													CalculatorIcon(node_10, { class: 'me-2 size-4' });
													$.next(2);
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_4, 2);

							$.component(node_11, () => Command.Separator, ($$anchor, Command_Separator) => {
								Command_Separator($$anchor, {});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Command.Group, ($$anchor, Command_Group_1) => {
								Command_Group_1($$anchor, {
									heading: 'Settings',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_3();
										var node_13 = $.first_child(fragment_7);

										$.component(node_13, () => Command.Item, ($$anchor, Command_Item_3) => {
											Command_Item_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_4();
													var node_14 = $.first_child(fragment_8);

													UserIcon(node_14, { class: 'me-2 size-4' });

													var node_15 = $.sibling(node_14, 4);

													$.component(node_15, () => Command.Shortcut, ($$anchor, Command_Shortcut) => {
														Command_Shortcut($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('⌘P');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_13, 2);

										$.component(node_16, () => Command.Item, ($$anchor, Command_Item_4) => {
											Command_Item_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_5();
													var node_17 = $.first_child(fragment_9);

													CreditCardIcon(node_17, { class: 'me-2 size-4' });

													var node_18 = $.sibling(node_17, 4);

													$.component(node_18, () => Command.Shortcut, ($$anchor, Command_Shortcut_1) => {
														Command_Shortcut_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('⌘B');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_16, 2);

										$.component(node_19, () => Command.Item, ($$anchor, Command_Item_5) => {
											Command_Item_5($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_6();
													var node_20 = $.first_child(fragment_10);

													SettingsIcon(node_20, { class: 'me-2 size-4' });

													var node_21 = $.sibling(node_20, 4);

													$.component(node_21, () => Command.Shortcut, ($$anchor, Command_Shortcut_2) => {
														Command_Shortcut_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('⌘S');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

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

	$.append($$anchor, fragment);
}