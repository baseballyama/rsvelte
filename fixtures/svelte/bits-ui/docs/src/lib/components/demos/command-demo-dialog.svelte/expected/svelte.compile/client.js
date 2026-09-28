import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command, Dialog } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import CodeBlock from "phosphor-svelte/lib/CodeBlock";
import Palette from "phosphor-svelte/lib/Palette";
import RadioButton from "phosphor-svelte/lib/RadioButton";
import Sticker from "phosphor-svelte/lib/Sticker";
import Textbox from "phosphor-svelte/lib/Textbox";

var root = $.from_html(`<!> Introduction`, 1);
var root_1 = $.from_html(`<!> Delegation`, 1);
var root_2 = $.from_html(`<!> Styling`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> Calendar`, 1);
var root_6 = $.from_html(`<!> Radio Group`, 1);
var root_7 = $.from_html(`<!> Combobox`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Command_demo_dialog($$anchor) {
	let dialogOpen = $.state(false);

	function handleKeydown(e) {
		if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			$.set(dialogOpen, true);
		}
	}

	var fragment = $.comment();

	$.event('keydown', $.document, handleKeydown);

	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(dialogOpen);
			},

			set open($$value) {
				$.set(dialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex\n	h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Open Command Menu ⌘J');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95  data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] sm:max-w-[490px] md:w-full',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'sr-only',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Command Menu');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'sr-only',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('This is the command menu. Use the arrow keys to navigate and press ⌘K to open the\n				search bar.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Command.Root, ($$anchor, Command_Root) => {
											Command_Root($$anchor, {
												class: 'divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden rounded-xl border',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_4();
													var node_8 = $.first_child(fragment_4);

													$.component(node_8, () => Command.Input, ($$anchor, Command_Input) => {
														Command_Input($$anchor, {
															class: 'focus-override h-input bg-background placeholder:text-foreground-alt/50 focus:outline-hidden inline-flex truncate rounded-xl px-4 text-sm transition-colors focus:ring-0',
															placeholder: 'Search for something...'
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Command.List, ($$anchor, Command_List) => {
														Command_List($$anchor, {
															class: 'max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_10 = $.first_child(fragment_5);

																$.component(node_10, () => Command.Viewport, ($$anchor, Command_Viewport) => {
																	Command_Viewport($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root_8();
																			var node_11 = $.first_child(fragment_6);

																			$.component(node_11, () => Command.Empty, ($$anchor, Command_Empty) => {
																				Command_Empty($$anchor, {
																					class: 'text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_3 = $.text('No results found.');

																						$.append($$anchor, text_3);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_12 = $.sibling(node_11, 2);

																			$.component(node_12, () => Command.Group, ($$anchor, Command_Group) => {
																				Command_Group($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_7 = root_4();
																						var node_13 = $.first_child(fragment_7);

																						$.component(node_13, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
																							Command_GroupHeading($$anchor, {
																								class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_4 = $.text('Suggestions');

																									$.append($$anchor, text_4);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_14 = $.sibling(node_13, 2);

																						$.component(node_14, () => Command.GroupItems, ($$anchor, Command_GroupItems) => {
																							Command_GroupItems($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_8 = root_3();
																									var node_15 = $.first_child(fragment_8);

																									$.component(node_15, () => Command.Item, ($$anchor, Command_Item) => {
																										Command_Item($$anchor, {
																											class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																											keywords: ["getting started", "tutorial"],
																											children: ($$anchor, $$slotProps) => {
																												var fragment_9 = root();
																												var node_16 = $.first_child(fragment_9);

																												Sticker(node_16, { class: 'size-4' });
																												$.next();
																												$.append($$anchor, fragment_9);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_17 = $.sibling(node_15, 2);

																									$.component(node_17, () => Command.Item, ($$anchor, Command_Item_1) => {
																										Command_Item_1($$anchor, {
																											class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																											keywords: ["child", "custom element", "snippets"],
																											children: ($$anchor, $$slotProps) => {
																												var fragment_10 = root_1();
																												var node_18 = $.first_child(fragment_10);

																												CodeBlock(node_18, { class: 'size-4 ' });
																												$.next();
																												$.append($$anchor, fragment_10);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_19 = $.sibling(node_17, 2);

																									$.component(node_19, () => Command.Item, ($$anchor, Command_Item_2) => {
																										Command_Item_2($$anchor, {
																											class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																											keywords: ["css", "theme", "colors", "fonts", "tailwind"],
																											children: ($$anchor, $$slotProps) => {
																												var fragment_11 = root_2();
																												var node_20 = $.first_child(fragment_11);

																												Palette(node_20, { class: 'size-4' });
																												$.next();
																												$.append($$anchor, fragment_11);
																											},
																											$$slots: { default: true }
																										});
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

																			var node_21 = $.sibling(node_12, 2);

																			$.component(node_21, () => Command.Separator, ($$anchor, Command_Separator) => {
																				Command_Separator($$anchor, {});
																			});

																			var node_22 = $.sibling(node_21, 2);

																			$.component(node_22, () => Command.Group, ($$anchor, Command_Group_1) => {
																				Command_Group_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = root_4();
																						var node_23 = $.first_child(fragment_12);

																						$.component(node_23, () => Command.GroupHeading, ($$anchor, Command_GroupHeading_1) => {
																							Command_GroupHeading_1($$anchor, {
																								class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_5 = $.text('Components');

																									$.append($$anchor, text_5);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_24 = $.sibling(node_23, 2);

																						$.component(node_24, () => Command.GroupItems, ($$anchor, Command_GroupItems_1) => {
																							Command_GroupItems_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_13 = root_3();
																									var node_25 = $.first_child(fragment_13);

																									$.component(node_25, () => Command.Item, ($$anchor, Command_Item_3) => {
																										Command_Item_3($$anchor, {
																											class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																											keywords: ["dates", "times"],
																											children: ($$anchor, $$slotProps) => {
																												var fragment_14 = root_5();
																												var node_26 = $.first_child(fragment_14);

																												CalendarBlank(node_26, { class: 'size-4' });
																												$.next();
																												$.append($$anchor, fragment_14);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_27 = $.sibling(node_25, 2);

																									$.component(node_27, () => Command.Item, ($$anchor, Command_Item_4) => {
																										Command_Item_4($$anchor, {
																											class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																											keywords: ["buttons", "forms"],
																											children: ($$anchor, $$slotProps) => {
																												var fragment_15 = root_6();
																												var node_28 = $.first_child(fragment_15);

																												RadioButton(node_28, { class: 'size-4' });
																												$.next();
																												$.append($$anchor, fragment_15);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_29 = $.sibling(node_27, 2);

																									$.component(node_29, () => Command.Item, ($$anchor, Command_Item_5) => {
																										Command_Item_5($$anchor, {
																											class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																											keywords: ["inputs", "text", "autocomplete"],
																											children: ($$anchor, $$slotProps) => {
																												var fragment_16 = root_7();
																												var node_30 = $.first_child(fragment_16);

																												Textbox(node_30, { class: 'size-4' });
																												$.next();
																												$.append($$anchor, fragment_16);
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