import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RedoIcon from "@lucide/svelte/icons/redo";
import UndoIcon from "@lucide/svelte/icons/undo";
import { setMode, mode } from "mode-watcher";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { FONT_HEADING_OPTIONS, FONTS } from "$lib/fonts.js";
import { useIsMac } from "$lib/hooks/use-is-mac.svelte.js";
import { buttonVariants } from "$lib/registry/ui/button/button.svelte";
import { cn } from "$lib/utils.js";
import IconPlaceholder from "./icon-placeholder/icon-placeholder.svelte";
import ModeSwitcher from "./mode-switcher.svelte";
import BaseColorPicker from "../../routes/(app)/(layout)/(create)/components/base-color-picker.svelte";
import ChartColorPicker from "../../routes/(app)/(layout)/(create)/components/chart-color-picker.svelte";
import CustomizerControls from "../../routes/(app)/(layout)/(create)/components/customizer-controls.svelte";
import FontPicker from "../../routes/(app)/(layout)/(create)/components/font-picker.svelte";
import IconLibraryPicker from "../../routes/(app)/(layout)/(create)/components/icon-library-picker.svelte";
import MenuAccentPicker from "../../routes/(app)/(layout)/(create)/components/menu-accent-picker.svelte";
import MenuColorPicker from "../../routes/(app)/(layout)/(create)/components/menu-color-picker.svelte";
import RadiusPicker from "../../routes/(app)/(layout)/(create)/components/radius-picker.svelte";
import StylePicker from "../../routes/(app)/(layout)/(create)/components/style-picker.svelte";
import ThemePicker from "../../routes/(app)/(layout)/(create)/components/theme-picker.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Mode</div> <div class="text-sm font-medium text-foreground"> </div></div> <div class="md:hidden [&amp;_svg]:size-5"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4.5"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 3l0 18"></path><path d="M12 9l4.65 -4.65"></path><path d="M12 14.3l7.37 -7.37"></path><path d="M12 19.6l8.85 -8.85"></path></svg> <span class="sr-only">Toggle theme</span></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-2"><!> <span>Undo</span></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex items-center gap-2"><!> <span>Redo</span></div> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Customizer($$anchor, $$props) {
	$.push($$props, true);

	const isMac = useIsMac();
	const designSystem = useDesignSystem();
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
					DropdownMenu_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "extend-touch-target hidden md:flex"));

								$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
									DropdownMenu_Trigger($$anchor, {
										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												lucide: 'SlidersHorizontalIcon',
												phosphor: 'SlidersHorizontalIcon',
												hugeicons: 'SlidersHorizontalIcon',
												tabler: 'IconAdjustmentsHorizontal',
												remixicon: 'RiSettingsLine'
											});
										},
										$$slots: { default: true }
									});
								});
							}

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									align: 'end',
									class: 'dark min-w-64 p-0',
									preventScroll: false,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_6();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
											DropdownMenu_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_5 = $.first_child(fragment_5);

													StylePicker(node_5, { submenu: true });

													var node_6 = $.sibling(node_5, 2);

													BaseColorPicker(node_6, { submenu: true });

													var node_7 = $.sibling(node_6, 2);

													ThemePicker(node_7, { submenu: true });

													var node_8 = $.sibling(node_7, 2);

													ChartColorPicker(node_8, { submenu: true });

													var node_9 = $.sibling(node_8, 2);

													IconLibraryPicker(node_9, { submenu: true });

													var node_10 = $.sibling(node_9, 2);

													FontPicker(node_10, {
														submenu: true,
														label: 'Heading',
														param: 'fontHeading',
														get fonts() {
															return FONT_HEADING_OPTIONS;
														}
													});

													var node_11 = $.sibling(node_10, 2);

													FontPicker(node_11, {
														submenu: true,
														label: 'Font',
														param: 'font',
														get fonts() {
															return FONTS;
														}
													});

													var node_12 = $.sibling(node_11, 2);

													RadiusPicker(node_12, { submenu: true });

													var node_13 = $.sibling(node_12, 2);

													MenuColorPicker(node_13, { submenu: true });

													var node_14 = $.sibling(node_13, 2);

													MenuAccentPicker(node_14, { submenu: true });

													var node_15 = $.sibling(node_14, 2);

													$.component(node_15, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
														DropdownMenu_Separator($$anchor, {});
													});

													var node_16 = $.sibling(node_15, 2);

													CustomizerControls(node_16, { submenu: true });
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_4, 2);

										$.component(node_17, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
											DropdownMenu_Separator_1($$anchor, {});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
											DropdownMenu_Group_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_19 = $.first_child(fragment_6);

													$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															closeOnSelect: false,
															onclick: () => {
																setMode(mode.current === "dark" ? "light" : "dark");
															},
															class: 'h-[calc(--spacing(13.5))] w-[140px] touch-manipulation justify-between rounded-xl border border-foreground/10 bg-muted/50 select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_1();
																var div = $.first_child(fragment_7);
																var div_1 = $.sibling($.child(div), 2);
																var text = $.only_child(div_1);

																$.reset(div);

																var node_20 = $.sibling(div, 4);

																$.component(node_20, () => Kbd.Root, ($$anchor, Kbd_Root) => {
																	Kbd_Root($$anchor, {
																		class: 'hidden bg-foreground/10 text-foreground md:flex',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('D');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																$.template_effect(() => $.set_text(text, `Switch to ${mode.current === "dark" ? "Light" : "Dark"} Mode`));
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

										var node_21 = $.sibling(node_18, 2);

										$.component(node_21, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
											DropdownMenu_Separator_2($$anchor, {});
										});

										var node_22 = $.sibling(node_21, 2);

										$.component(node_22, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
											DropdownMenu_Group_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_2();
													var node_23 = $.first_child(fragment_8);

													{
														let $0 = $.derived(() => !designSystem.canUndo);

														$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
															DropdownMenu_Item_1($$anchor, {
																closeOnSelect: false,
																onclick: () => designSystem.undo(),
																get disabled() {
																	return $.get($0);
																},
																class: 'justify-between',
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = root_3();
																	var div_2 = $.first_child(fragment_9);
																	var node_24 = $.child(div_2);

																	UndoIcon(node_24, { class: 'size-4' });
																	$.next(2);
																	$.reset(div_2);

																	var node_25 = $.sibling(div_2, 2);

																	$.component(node_25, () => Kbd.Group, ($$anchor, Kbd_Group) => {
																		Kbd_Group($$anchor, {
																			class: 'hidden md:flex',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_10 = root_2();
																				var node_26 = $.first_child(fragment_10);

																				$.component(node_26, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
																					Kbd_Root_1($$anchor, {
																						class: 'bg-foreground/10 text-foreground',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_2 = $.text();

																							$.template_effect(() => $.set_text(text_2, isMac.cmdOrCtrl));
																							$.append($$anchor, text_2);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_27 = $.sibling(node_26, 2);

																				$.component(node_27, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
																					Kbd_Root_2($$anchor, {
																						class: 'bg-foreground/10 text-foreground',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_3 = $.text('z');

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

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															});
														});
													}

													var node_28 = $.sibling(node_23, 2);

													{
														let $0 = $.derived(() => !designSystem.canRedo);

														$.component(node_28, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
															DropdownMenu_Item_2($$anchor, {
																closeOnSelect: false,
																onclick: () => designSystem.redo(),
																get disabled() {
																	return $.get($0);
																},
																class: 'justify-between',
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = root_5();
																	var div_3 = $.first_child(fragment_12);
																	var node_29 = $.child(div_3);

																	RedoIcon(node_29, { class: 'size-4' });
																	$.next(2);
																	$.reset(div_3);

																	var node_30 = $.sibling(div_3, 2);

																	$.component(node_30, () => Kbd.Group, ($$anchor, Kbd_Group_1) => {
																		Kbd_Group_1($$anchor, {
																			class: 'hidden md:flex',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_13 = root_4();
																				var node_31 = $.first_child(fragment_13);

																				$.component(node_31, () => Kbd.Root, ($$anchor, Kbd_Root_3) => {
																					Kbd_Root_3($$anchor, {
																						class: 'bg-foreground/10 text-foreground',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_4 = $.text('⇧');

																							$.append($$anchor, text_4);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_32 = $.sibling(node_31, 2);

																				$.component(node_32, () => Kbd.Root, ($$anchor, Kbd_Root_4) => {
																					Kbd_Root_4($$anchor, {
																						class: 'bg-foreground/10 text-foreground',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_5 = $.text();

																							$.template_effect(() => $.set_text(text_5, isMac.cmdOrCtrl));
																							$.append($$anchor, text_5);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_33 = $.sibling(node_32, 2);

																				$.component(node_33, () => Kbd.Root, ($$anchor, Kbd_Root_5) => {
																					Kbd_Root_5($$anchor, {
																						class: 'bg-foreground/10 text-foreground',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_6 = $.text('Z');

																							$.append($$anchor, text_6);
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
													}

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

	var node_34 = $.sibling(node, 2);

	ModeSwitcher(node_34, { class: 'md:hidden' });
	$.append($$anchor, fragment);
	$.pop();
}