import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar } from "bits-ui";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import Cat from "phosphor-svelte/lib/Cat";
import Check from "phosphor-svelte/lib/Check";

const SwitchOn = ($$anchor) => {
	var div = root();

	$.append($$anchor, div);
};

const SwitchOff = ($$anchor) => {
	var div_1 = root_1();

	$.append($$anchor, div_1);
};

var root = $.from_html(`<div class="bg-dark-10 peer inline-flex h-[15.6px] min-h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[1.5px]"><span class="bg-background dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-[10px] rounded-full"></span></div>`);
var root_1 = $.from_html(`<div class="bg-dark-10 shadow-mini-inset peer inline-flex h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[3px] transition-colors"><span class="bg-background shadow-mini dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-0 rounded-full transition-transform dark:border"></span></div>`);
var root_2 = $.from_html(` <div class="ml-auto flex items-center"><!></div>`, 1);
var root_3 = $.from_html(` <div class="ml-auto size-5"><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`Find <div class="ml-auto flex items-center"><!></div>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<div class="px-2.5"><!></div> <!> <!> <!> <!>`, 1);

export default function Menubar_demo($$anchor) {
	let selectedView = $.state("table");
	let selectedProfile = $.state("pavel");

	let grids = $.proxy([
		{ checked: true, label: "Pixel" },
		{ checked: false, label: "Layout" }
	]);

	let showConfigs = $.proxy([
		{ checked: true, label: "Show Bookmarks" },
		{ checked: false, label: "Show Full URLs" }
	]);

	const profiles = [
		{ value: "hunter", label: "Hunter" },
		{ value: "pavel", label: "Pavel" },
		{ value: "adrian", label: "Adrian" }
	];

	const views = [
		{ value: "table", label: "Table" },
		{ value: "board", label: "Board" },
		{ value: "gallery", label: "Gallery" }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
		Menubar_Root($$anchor, {
			class: 'rounded-10px border-dark-10 bg-background-alt shadow-mini flex h-12 items-center gap-1 border px-[3px]',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_9();
				var div_2 = $.first_child(fragment_1);
				var node_1 = $.child(div_2);

				Cat(node_1, { class: 'size-6' });
				$.reset(div_2);

				var node_2 = $.sibling(div_2, 2);

				$.component(node_2, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
					Menubar_Menu($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_5();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Menubar.Trigger, ($$anchor, Menubar_Trigger) => {
								Menubar_Trigger($$anchor, {
									class: 'rounded-9px data-highlighted:bg-muted data-[state=open]:bg-muted inline-flex h-10 cursor-default items-center justify-center px-3 text-sm font-medium focus-visible:outline-none',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('File');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Menubar.Portal, ($$anchor, Menubar_Portal) => {
								Menubar_Portal($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Menubar.Content, ($$anchor, Menubar_Content) => {
											Menubar_Content($$anchor, {
												class: 'focus-override border-muted bg-background  shadow-popover focus-visible:outline-hidden z-50 w-fit rounded-xl border px-1 py-1.5',
												align: 'start',
												sideOffset: 3,
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_4();
													var node_6 = $.first_child(fragment_4);

													$.each(node_6, 17, () => grids, (grid) => grid.label, ($$anchor, grid, $$index) => {
														var fragment_5 = $.comment();
														var node_7 = $.first_child(fragment_5);

														{
															const children = ($$anchor, $$arg0) => {
																let checked = () => ($$arg0?.()).checked;

																$.next();

																var fragment_6 = root_2();
																var text_1 = $.first_child(fragment_6);
																var div_3 = $.sibling(text_1);
																var node_8 = $.child(div_3);

																{
																	var consequent = ($$anchor) => {
																		SwitchOn($$anchor);
																	};

																	var alternate = ($$anchor) => {
																		SwitchOff($$anchor);
																	};

																	$.if(node_8, ($$render) => {
																		if (checked()) $$render(consequent); else $$render(alternate, -1);
																	});
																}

																$.reset(div_3);
																$.template_effect(() => $.set_text(text_1, `${$.get(grid).label ?? ''} grid `));
																$.append($$anchor, fragment_6);
															};

															$.component(node_7, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem) => {
																Menubar_CheckboxItem($$anchor, {
																	class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																	get checked() {
																		return $.get(grid).checked;
																	},

																	set checked($$value) {
																		($.get(grid).checked = $$value);
																	},
																	children,
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_5);
													});

													var node_9 = $.sibling(node_6, 2);

													$.component(node_9, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
														Menubar_Separator($$anchor, { class: 'bg-muted my-1 -ml-1 -mr-1 block h-px' });
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Menubar.RadioGroup, ($$anchor, Menubar_RadioGroup) => {
														Menubar_RadioGroup($$anchor, {
															get value() {
																return $.get(selectedView);
															},

															set value($$value) {
																$.set(selectedView, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_11 = $.first_child(fragment_9);

																$.each(node_11, 19, () => views, (view, i) => view.label + i, ($$anchor, view) => {
																	var fragment_10 = $.comment();
																	var node_12 = $.first_child(fragment_10);

																	{
																		const children = ($$anchor, $$arg0) => {
																			let checked = () => ($$arg0?.()).checked;

																			$.next();

																			var fragment_11 = root_3();
																			var text_2 = $.first_child(fragment_11);
																			var div_4 = $.sibling(text_2);
																			var node_13 = $.child(div_4);

																			{
																				var consequent_1 = ($$anchor) => {
																					Check($$anchor, { class: 'size-5' });
																				};

																				$.if(node_13, ($$render) => {
																					if (checked()) $$render(consequent_1);
																				});
																			}

																			$.reset(div_4);
																			$.template_effect(() => $.set_text(text_2, `${$.get(view).label ?? ''} `));
																			$.append($$anchor, fragment_11);
																		};

																		$.component(node_12, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem) => {
																			Menubar_RadioItem($$anchor, {
																				get value() {
																					return $.get(view).value;
																				},
																				class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center gap-2 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																				children,
																				$$slots: { default: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_10);
																});

																$.append($$anchor, fragment_9);
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

				var node_14 = $.sibling(node_2, 2);

				$.component(node_14, () => Menubar.Menu, ($$anchor, Menubar_Menu_1) => {
					Menubar_Menu_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_5();
							var node_15 = $.first_child(fragment_13);

							$.component(node_15, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_1) => {
								Menubar_Trigger_1($$anchor, {
									class: 'data-highlighted:bg-muted data-[state=open]:bg-muted inline-flex h-10 cursor-default items-center justify-center rounded-[9px] px-3 text-sm font-medium focus-visible:outline-none',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Edit');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_16 = $.sibling(node_15, 2);

							$.component(node_16, () => Menubar.Portal, ($$anchor, Menubar_Portal_1) => {
								Menubar_Portal_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = $.comment();
										var node_17 = $.first_child(fragment_14);

										$.component(node_17, () => Menubar.Content, ($$anchor, Menubar_Content_1) => {
											Menubar_Content_1($$anchor, {
												class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden z-50 w-full rounded-xl border px-1 py-1.5',
												align: 'start',
												sideOffset: 3,
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_8();
													var node_18 = $.first_child(fragment_15);

													$.component(node_18, () => Menubar.Item, ($$anchor, Menubar_Item) => {
														Menubar_Item($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Undo');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
														Menubar_Item_1($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 min-w-[130px] select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Redo');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_19, 2);

													$.component(node_20, () => Menubar.Separator, ($$anchor, Menubar_Separator_1) => {
														Menubar_Separator_1($$anchor, {});
													});

													var node_21 = $.sibling(node_20, 2);

													$.component(node_21, () => Menubar.Sub, ($$anchor, Menubar_Sub) => {
														Menubar_Sub($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = root_5();
																var node_22 = $.first_child(fragment_16);

																$.component(node_22, () => Menubar.SubTrigger, ($$anchor, Menubar_SubTrigger) => {
																	Menubar_SubTrigger($$anchor, {
																		class: 'rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted flex h-10 select-none items-center gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_17 = root_6();
																			var div_5 = $.sibling($.first_child(fragment_17));
																			var node_23 = $.child(div_5);

																			CaretRight(node_23, { class: 'text-foreground-alt h-4 w-4' });
																			$.reset(div_5);
																			$.append($$anchor, fragment_17);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_24 = $.sibling(node_22, 2);

																$.component(node_24, () => Menubar.SubContent, ($$anchor, Menubar_SubContent) => {
																	Menubar_SubContent($$anchor, {
																		class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden w-full max-w-[209px] rounded-xl border px-1 py-1.5',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = root_7();
																			var node_25 = $.first_child(fragment_18);

																			$.component(node_25, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
																				Menubar_Item_2($$anchor, {
																					class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('Search the web');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_26 = $.sibling(node_25, 2);

																			$.component(node_26, () => Menubar.Separator, ($$anchor, Menubar_Separator_2) => {
																				Menubar_Separator_2($$anchor, {});
																			});

																			var node_27 = $.sibling(node_26, 2);

																			$.component(node_27, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
																				Menubar_Item_3($$anchor, {
																					class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_7 = $.text('Find...');

																						$.append($$anchor, text_7);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_28 = $.sibling(node_27, 2);

																			$.component(node_28, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
																				Menubar_Item_4($$anchor, {
																					class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_8 = $.text('Find Next');

																						$.append($$anchor, text_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_29 = $.sibling(node_28, 2);

																			$.component(node_29, () => Menubar.Item, ($$anchor, Menubar_Item_5) => {
																				Menubar_Item_5($$anchor, {
																					class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text('Find Previous');

																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_18);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													var node_30 = $.sibling(node_21, 2);

													$.component(node_30, () => Menubar.Separator, ($$anchor, Menubar_Separator_3) => {
														Menubar_Separator_3($$anchor, {});
													});

													var node_31 = $.sibling(node_30, 2);

													$.component(node_31, () => Menubar.Item, ($$anchor, Menubar_Item_6) => {
														Menubar_Item_6($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text('Cut');

																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});
													});

													var node_32 = $.sibling(node_31, 2);

													$.component(node_32, () => Menubar.Item, ($$anchor, Menubar_Item_7) => {
														Menubar_Item_7($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('Copy');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													var node_33 = $.sibling(node_32, 2);

													$.component(node_33, () => Menubar.Item, ($$anchor, Menubar_Item_8) => {
														Menubar_Item_8($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_12 = $.text('Paste');

																$.append($$anchor, text_12);
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
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});

				var node_34 = $.sibling(node_14, 2);

				$.component(node_34, () => Menubar.Menu, ($$anchor, Menubar_Menu_2) => {
					Menubar_Menu_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_5();
							var node_35 = $.first_child(fragment_19);

							$.component(node_35, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_2) => {
								Menubar_Trigger_2($$anchor, {
									class: 'rounded-9px data-highlighted:bg-muted data-[state=open]:bg-muted inline-flex h-10 cursor-default items-center justify-center px-3 text-sm font-medium focus-visible:outline-none',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text('View');

										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});
							});

							var node_36 = $.sibling(node_35, 2);

							$.component(node_36, () => Menubar.Portal, ($$anchor, Menubar_Portal_2) => {
								Menubar_Portal_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_20 = $.comment();
										var node_37 = $.first_child(fragment_20);

										$.component(node_37, () => Menubar.Content, ($$anchor, Menubar_Content_2) => {
											Menubar_Content_2($$anchor, {
												class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden z-50 w-full max-w-[220px] rounded-xl border px-1 py-1.5',
												align: 'start',
												sideOffset: 3,
												children: ($$anchor, $$slotProps) => {
													var fragment_21 = root_8();
													var node_38 = $.first_child(fragment_21);

													$.each(node_38, 19, () => showConfigs, (config, i) => config.label + i, ($$anchor, config, i) => {
														var fragment_22 = $.comment();
														var node_39 = $.first_child(fragment_22);

														{
															const children = ($$anchor, $$arg0) => {
																let checked = () => ($$arg0?.()).checked;

																$.next();

																var fragment_23 = root_2();
																var text_14 = $.first_child(fragment_23);
																var div_6 = $.sibling(text_14);
																var node_40 = $.child(div_6);

																{
																	var consequent_2 = ($$anchor) => {
																		SwitchOn($$anchor);
																	};

																	var alternate_1 = ($$anchor) => {
																		SwitchOff($$anchor);
																	};

																	$.if(node_40, ($$render) => {
																		if (checked()) $$render(consequent_2); else $$render(alternate_1, -1);
																	});
																}

																$.reset(div_6);
																$.template_effect(() => $.set_text(text_14, `${$.get(config).label ?? ''} `));
																$.append($$anchor, fragment_23);
															};

															$.component(node_39, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_1) => {
																Menubar_CheckboxItem_1($$anchor, {
																	class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																	get checked() {
																		return $.get(config).checked;
																	},

																	set checked($$value) {
																		($.get(config).checked = $$value);
																	},
																	children,
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_22);
													});

													var node_41 = $.sibling(node_38, 2);

													$.component(node_41, () => Menubar.Separator, ($$anchor, Menubar_Separator_4) => {
														Menubar_Separator_4($$anchor, {});
													});

													var node_42 = $.sibling(node_41, 2);

													$.component(node_42, () => Menubar.Item, ($$anchor, Menubar_Item_9) => {
														Menubar_Item_9($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_15 = $.text('Reload');

																$.append($$anchor, text_15);
															},
															$$slots: { default: true }
														});
													});

													var node_43 = $.sibling(node_42, 2);

													$.component(node_43, () => Menubar.Item, ($$anchor, Menubar_Item_10) => {
														Menubar_Item_10($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_16 = $.text('Force Reload');

																$.append($$anchor, text_16);
															},
															$$slots: { default: true }
														});
													});

													var node_44 = $.sibling(node_43, 2);

													$.component(node_44, () => Menubar.Separator, ($$anchor, Menubar_Separator_5) => {
														Menubar_Separator_5($$anchor, {});
													});

													var node_45 = $.sibling(node_44, 2);

													$.component(node_45, () => Menubar.Item, ($$anchor, Menubar_Item_11) => {
														Menubar_Item_11($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_17 = $.text('Toggle Fullscreen');

																$.append($$anchor, text_17);
															},
															$$slots: { default: true }
														});
													});

													var node_46 = $.sibling(node_45, 2);

													$.component(node_46, () => Menubar.Separator, ($$anchor, Menubar_Separator_6) => {
														Menubar_Separator_6($$anchor, {});
													});

													var node_47 = $.sibling(node_46, 2);

													$.component(node_47, () => Menubar.Item, ($$anchor, Menubar_Item_12) => {
														Menubar_Item_12($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_18 = $.text('Hide Sidebar');

																$.append($$anchor, text_18);
															},
															$$slots: { default: true }
														});
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

							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});
				});

				var node_48 = $.sibling(node_34, 2);

				$.component(node_48, () => Menubar.Menu, ($$anchor, Menubar_Menu_3) => {
					Menubar_Menu_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_26 = root_5();
							var node_49 = $.first_child(fragment_26);

							$.component(node_49, () => Menubar.Trigger, ($$anchor, Menubar_Trigger_3) => {
								Menubar_Trigger_3($$anchor, {
									class: 'data-highlighted:bg-muted data-[state=open]:bg-muted mr-[20px] inline-flex h-10 cursor-default items-center justify-center rounded-[9px] px-3 text-sm font-medium focus-visible:outline-none',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_19 = $.text('Profiles');

										$.append($$anchor, text_19);
									},
									$$slots: { default: true }
								});
							});

							var node_50 = $.sibling(node_49, 2);

							$.component(node_50, () => Menubar.Portal, ($$anchor, Menubar_Portal_3) => {
								Menubar_Portal_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_27 = $.comment();
										var node_51 = $.first_child(fragment_27);

										$.component(node_51, () => Menubar.Content, ($$anchor, Menubar_Content_3) => {
											Menubar_Content_3($$anchor, {
												class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden z-50 w-full max-w-[220px] rounded-xl border px-1 py-1.5',
												align: 'start',
												sideOffset: 3,
												children: ($$anchor, $$slotProps) => {
													var fragment_28 = root_7();
													var node_52 = $.first_child(fragment_28);

													$.component(node_52, () => Menubar.RadioGroup, ($$anchor, Menubar_RadioGroup_1) => {
														Menubar_RadioGroup_1($$anchor, {
															get value() {
																return $.get(selectedProfile);
															},

															set value($$value) {
																$.set(selectedProfile, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_29 = $.comment();
																var node_53 = $.first_child(fragment_29);

																$.each(node_53, 19, () => profiles, (profile, i) => profile.label + i, ($$anchor, profile) => {
																	var fragment_30 = $.comment();
																	var node_54 = $.first_child(fragment_30);

																	{
																		const children = ($$anchor, $$arg0) => {
																			let checked = () => ($$arg0?.()).checked;

																			$.next();

																			var fragment_31 = root_2();
																			var text_20 = $.first_child(fragment_31);
																			var div_7 = $.sibling(text_20);
																			var node_55 = $.child(div_7);

																			{
																				var consequent_3 = ($$anchor) => {
																					Check($$anchor, { class: 'size-5' });
																				};

																				$.if(node_55, ($$render) => {
																					if (checked()) $$render(consequent_3);
																				});
																			}

																			$.reset(div_7);
																			$.template_effect(() => $.set_text(text_20, `${$.get(profile).label ?? ''} `));
																			$.append($$anchor, fragment_31);
																		};

																		$.component(node_54, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_1) => {
																			Menubar_RadioItem_1($$anchor, {
																				class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																				get value() {
																					return $.get(profile).value;
																				},
																				children,
																				$$slots: { default: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_30);
																});

																$.append($$anchor, fragment_29);
															},
															$$slots: { default: true }
														});
													});

													var node_56 = $.sibling(node_52, 2);

													$.component(node_56, () => Menubar.Separator, ($$anchor, Menubar_Separator_7) => {
														Menubar_Separator_7($$anchor, {});
													});

													var node_57 = $.sibling(node_56, 2);

													$.component(node_57, () => Menubar.Item, ($$anchor, Menubar_Item_13) => {
														Menubar_Item_13($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_21 = $.text('Edit...');

																$.append($$anchor, text_21);
															},
															$$slots: { default: true }
														});
													});

													var node_58 = $.sibling(node_57, 2);

													$.component(node_58, () => Menubar.Separator, ($$anchor, Menubar_Separator_8) => {
														Menubar_Separator_8($$anchor, {});
													});

													var node_59 = $.sibling(node_58, 2);

													$.component(node_59, () => Menubar.Item, ($$anchor, Menubar_Item_14) => {
														Menubar_Item_14($$anchor, {
															class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_22 = $.text('Add Profile...');

																$.append($$anchor, text_22);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_28);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}