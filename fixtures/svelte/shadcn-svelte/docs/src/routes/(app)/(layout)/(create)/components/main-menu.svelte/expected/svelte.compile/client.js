import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setMode, mode } from "mode-watcher";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { useIsMac } from "$lib/hooks/use-is-mac.svelte.js";
import { cn } from "$lib/utils.js";
import * as Picker from "./picker/index.js";
import { ActionMenuCtx } from "./action-menu-context.svelte.js";

var root = $.from_html(`<span class="font-medium">Menu</span> <!>`, 1);
var root_1 = $.from_html(`Navigate... <!>`, 1);
var root_2 = $.from_html(`Shuffle <!>`, 1);
var root_3 = $.from_html(`Light/Dark <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`Undo <!>`, 1);
var root_6 = $.from_html(`Redo <!>`, 1);
var root_7 = $.from_html(`Reset <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> <!>`, 1);

export default function Main_menu($$anchor, $$props) {
	$.push($$props, true);

	const isMac = useIsMac();
	const designSystem = useDesignSystem();
	const actionMenuCtx = ActionMenuCtx.get();

	function toggleTheme() {
		setMode(mode.current === "dark" ? "light" : "dark");
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Picker.Root, ($$anchor, Picker_Root) => {
		Picker_Root($$anchor, {
			submenu: false,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_9();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn("flex items-center justify-between gap-2 rounded-lg px-1.75 ring-1 ring-foreground/10 focus-visible:ring-1", $$props.class));

					$.component(node_1, () => Picker.Trigger, ($$anchor, Picker_Trigger) => {
						Picker_Trigger($$anchor, {
							submenu: false,
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.sibling($.first_child(fragment_2), 2);

								IconPlaceholder(node_2, {
									lucide: 'MenuIcon',
									hugeicons: 'Menu09Icon',
									phosphor: 'ListIcon',
									tabler: 'IconMenu2',
									remixicon: 'RiMenuLine',
									class: 'size-5'
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Picker.Content, ($$anchor, Picker_Content) => {
					Picker_Content($$anchor, {
						side: 'right',
						align: 'start',
						alignOffset: -8,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_4();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Picker.Group, ($$anchor, Picker_Group) => {
								Picker_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_4();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Picker.Item, ($$anchor, Picker_Item) => {
											Picker_Item($$anchor, {
												onSelect: () => actionMenuCtx.open = true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_5 = root_1();
													var node_6 = $.sibling($.first_child(fragment_5));

													$.component(node_6, () => Picker.Shortcut, ($$anchor, Picker_Shortcut) => {
														Picker_Shortcut($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, isMac.current ? "⌘P" : "Ctrl+P"));
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_5, 2);

										$.component(node_7, () => Picker.Item, ($$anchor, Picker_Item_1) => {
											Picker_Item_1($$anchor, {
												onSelect: () => designSystem.randomize(),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_7 = root_2();
													var node_8 = $.sibling($.first_child(fragment_7));

													$.component(node_8, () => Picker.Shortcut, ($$anchor, Picker_Shortcut_1) => {
														Picker_Shortcut_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('R');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => Picker.Item, ($$anchor, Picker_Item_2) => {
											Picker_Item_2($$anchor, {
												onSelect: toggleTheme,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_8 = root_3();
													var node_10 = $.sibling($.first_child(fragment_8));

													$.component(node_10, () => Picker.Shortcut, ($$anchor, Picker_Shortcut_2) => {
														Picker_Shortcut_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('D');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_4, 2);

							$.component(node_11, () => Picker.Separator, ($$anchor, Picker_Separator) => {
								Picker_Separator($$anchor, {});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Picker.Group, ($$anchor, Picker_Group_1) => {
								Picker_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_8();
										var node_13 = $.first_child(fragment_9);

										{
											let $0 = $.derived(() => !designSystem.canUndo);

											$.component(node_13, () => Picker.Item, ($$anchor, Picker_Item_3) => {
												Picker_Item_3($$anchor, {
													onSelect: () => designSystem.undo(),
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_10 = root_5();
														var node_14 = $.sibling($.first_child(fragment_10));

														$.component(node_14, () => Picker.Shortcut, ($$anchor, Picker_Shortcut_3) => {
															Picker_Shortcut_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text();

																	$.template_effect(() => $.set_text(text_3, isMac.current ? "⌘Z" : "Ctrl+Z"));
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
										}

										var node_15 = $.sibling(node_13, 2);

										{
											let $0 = $.derived(() => !designSystem.canRedo);

											$.component(node_15, () => Picker.Item, ($$anchor, Picker_Item_4) => {
												Picker_Item_4($$anchor, {
													onSelect: () => designSystem.redo(),
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_12 = root_6();
														var node_16 = $.sibling($.first_child(fragment_12));

														$.component(node_16, () => Picker.Shortcut, ($$anchor, Picker_Shortcut_4) => {
															Picker_Shortcut_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, isMac.current ? "⇧⌘Z" : "Ctrl+Shift+Z"));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_12);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_17 = $.sibling(node_15, 2);

										$.component(node_17, () => Picker.Separator, ($$anchor, Picker_Separator_1) => {
											Picker_Separator_1($$anchor, {});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => Picker.Item, ($$anchor, Picker_Item_5) => {
											Picker_Item_5($$anchor, {
												onSelect: () => designSystem.reset(),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_14 = root_7();
													var node_19 = $.sibling($.first_child(fragment_14));

													$.component(node_19, () => Picker.Shortcut, ($$anchor, Picker_Shortcut_5) => {
														Picker_Shortcut_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text();

																$.template_effect(() => $.set_text(text_5, isMac.current ? "⇧R" : "Shift+R"));
																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}