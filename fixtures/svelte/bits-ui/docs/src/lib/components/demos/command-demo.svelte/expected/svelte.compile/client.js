import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";
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

export default function Command_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			class: 'divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden rounded-xl border',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, {
						class: 'focus-override h-input placeholder:text-foreground-alt/50 bg-background focus:outline-hidden inline-flex truncate rounded-tl-xl rounded-tr-xl px-4 text-sm transition-colors focus:ring-0',
						placeholder: 'Search for something...'
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						class: 'max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Command.Viewport, ($$anchor, Command_Viewport) => {
								Command_Viewport($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_8();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
											Command_Empty($$anchor, {
												class: 'text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('No results found.');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
											Command_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_4();
													var node_6 = $.first_child(fragment_4);

													$.component(node_6, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
														Command_GroupHeading($$anchor, {
															class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Suggestions');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Command.GroupItems, ($$anchor, Command_GroupItems) => {
														Command_GroupItems($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root_3();
																var node_8 = $.first_child(fragment_5);

																$.component(node_8, () => Command.Item, ($$anchor, Command_Item) => {
																	Command_Item($$anchor, {
																		class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																		keywords: ["getting started", "tutorial"],
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_9 = $.first_child(fragment_6);

																			Sticker(node_9, { class: 'size-4' });
																			$.next();
																			$.append($$anchor, fragment_6);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_8, 2);

																$.component(node_10, () => Command.Item, ($$anchor, Command_Item_1) => {
																	Command_Item_1($$anchor, {
																		class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																		keywords: ["child", "custom element", "snippets"],
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_1();
																			var node_11 = $.first_child(fragment_7);

																			CodeBlock(node_11, { class: 'size-4 ' });
																			$.next();
																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_12 = $.sibling(node_10, 2);

																$.component(node_12, () => Command.Item, ($$anchor, Command_Item_2) => {
																	Command_Item_2($$anchor, {
																		class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																		keywords: ["css", "theme", "colors", "fonts", "tailwind"],
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = root_2();
																			var node_13 = $.first_child(fragment_8);

																			Palette(node_13, { class: 'size-4' });
																			$.next();
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

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_5, 2);

										$.component(node_14, () => Command.Separator, ($$anchor, Command_Separator) => {
											Command_Separator($$anchor, { class: 'bg-foreground/5 h-px w-full' });
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Command.Group, ($$anchor, Command_Group_1) => {
											Command_Group_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_4();
													var node_16 = $.first_child(fragment_9);

													$.component(node_16, () => Command.GroupHeading, ($$anchor, Command_GroupHeading_1) => {
														Command_GroupHeading_1($$anchor, {
															class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Components');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_17 = $.sibling(node_16, 2);

													$.component(node_17, () => Command.GroupItems, ($$anchor, Command_GroupItems_1) => {
														Command_GroupItems_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_3();
																var node_18 = $.first_child(fragment_10);

																$.component(node_18, () => Command.Item, ($$anchor, Command_Item_3) => {
																	Command_Item_3($$anchor, {
																		class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																		keywords: ["dates", "times"],
																		children: ($$anchor, $$slotProps) => {
																			var fragment_11 = root_5();
																			var node_19 = $.first_child(fragment_11);

																			CalendarBlank(node_19, { class: 'size-4' });
																			$.next();
																			$.append($$anchor, fragment_11);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_20 = $.sibling(node_18, 2);

																$.component(node_20, () => Command.Item, ($$anchor, Command_Item_4) => {
																	Command_Item_4($$anchor, {
																		class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																		keywords: ["buttons", "forms"],
																		children: ($$anchor, $$slotProps) => {
																			var fragment_12 = root_6();
																			var node_21 = $.first_child(fragment_12);

																			RadioButton(node_21, { class: 'size-4' });
																			$.next();
																			$.append($$anchor, fragment_12);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_22 = $.sibling(node_20, 2);

																$.component(node_22, () => Command.Item, ($$anchor, Command_Item_5) => {
																	Command_Item_5($$anchor, {
																		class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																		keywords: ["inputs", "text", "autocomplete"],
																		children: ($$anchor, $$slotProps) => {
																			var fragment_13 = root_7();
																			var node_23 = $.first_child(fragment_13);

																			Textbox(node_23, { class: 'size-4' });
																			$.next();
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