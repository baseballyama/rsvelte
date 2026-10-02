import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, DropdownMenu } from "bits-ui";
import Cardholder from "phosphor-svelte/lib/Cardholder";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import DotsThree from "phosphor-svelte/lib/DotsThree";
import GearSix from "phosphor-svelte/lib/GearSix";
import UserCircle from "phosphor-svelte/lib/UserCircle";
import UserCirclePlus from "phosphor-svelte/lib/UserCirclePlus";
import Bell from "phosphor-svelte/lib/Bell";
import Check from "phosphor-svelte/lib/Check";
import DotOutline from "phosphor-svelte/lib/DotOutline";
import { fly } from "svelte/transition";

var root = $.from_html(`<div class="flex items-center"><!> Profile</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">P</kbd></div>`, 1);
var root_1 = $.from_html(`<div class="flex items-center"><!> Billing</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">B</kbd></div>`, 1);
var root_2 = $.from_html(`<div class="flex items-center"><!> Settings</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-xs">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[10px]">S</kbd></div>`, 1);
var root_3 = $.from_html(`<div class="flex items-center pr-4"><!> Notifications</div> <div class="ml-auto flex items-center gap-px"><!></div>`, 1);
var root_4 = $.from_html(`<div class="flex items-center"><!> Workspace</div> <div class="ml-auto flex items-center gap-px"><!></div>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> @huntabyte <!>`, 1);
var root_7 = $.from_html(`<!> @pavel_stianko <!>`, 1);
var root_8 = $.from_html(`<!> @cokakoala_ <!>`, 1);
var root_9 = $.from_html(`<!> @thomasglopes <!>`, 1);
var root_10 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`<div><div><!> <!> <!> <!> <!></div></div>`);

export default function Dropdown_menu_demo_transition($$anchor) {
	let notifications = $.state(false);
	let invited = $.state("");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						class: 'border-input shadow-btn hover:bg-muted inline-flex h-10 w-10 select-none items-center justify-center rounded-full border text-sm font-medium active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							DotsThree($$anchor, { class: 'text-foreground h-6 w-6' });
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								const child = ($$anchor, $$arg0) => {
									let wrapperProps = () => ($$arg0?.()).wrapperProps;
									let props = () => ($$arg0?.()).props;
									let open = () => ($$arg0?.()).open;
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										var consequent_5 = ($$anchor) => {
											var div = root_11();

											$.attribute_effect(div, () => ({ ...wrapperProps() }));

											var div_1 = $.child(div);

											$.attribute_effect(div_1, () => ({ ...props() }));

											var node_5 = $.child(div_1);

											$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
												DropdownMenu_Item($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var div_2 = $.first_child(fragment_5);
														var node_6 = $.child(div_2);

														UserCircle(node_6, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_2);
														$.next(2);
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_5, 2);

											$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
												DropdownMenu_Item_1($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_1();
														var div_3 = $.first_child(fragment_6);
														var node_8 = $.child(div_3);

														Cardholder(node_8, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_3);
														$.next(2);
														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_9 = $.sibling(node_7, 2);

											$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
												DropdownMenu_Item_2($$anchor, {
													class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root_2();
														var div_4 = $.first_child(fragment_7);
														var node_10 = $.child(div_4);

														GearSix(node_10, { class: 'text-foreground-alt mr-2 size-5' });
														$.next();
														$.reset(div_4);
														$.next(2);
														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											var node_11 = $.sibling(node_9, 2);

											{
												const children = ($$anchor, $$arg0) => {
													let checked = () => ($$arg0?.()).checked;
													var fragment_8 = root_3();
													var div_5 = $.first_child(fragment_8);
													var node_12 = $.child(div_5);

													Bell(node_12, { class: 'text-foreground-alt mr-2 size-5' });
													$.next();
													$.reset(div_5);

													var div_6 = $.sibling(div_5, 2);
													var node_13 = $.child(div_6);

													{
														var consequent = ($$anchor) => {
															Check($$anchor, { class: 'size-4' });
														};

														$.if(node_13, ($$render) => {
															if (checked()) $$render(consequent);
														});
													}

													$.reset(div_6);
													$.append($$anchor, fragment_8);
												};

												$.component(node_11, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
													DropdownMenu_CheckboxItem($$anchor, {
														class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
														get checked() {
															return $.get(notifications);
														},

														set checked($$value) {
															$.set(notifications, $$value, true);
														},
														children,
														$$slots: { default: true }
													});
												});
											}

											var node_14 = $.sibling(node_11, 2);

											$.component(node_14, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
												DropdownMenu_Sub($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = root_5();
														var node_15 = $.first_child(fragment_10);

														$.component(node_15, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
															DropdownMenu_SubTrigger($$anchor, {
																class: 'rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$anchor, $$slotProps) => {
																	var fragment_11 = root_4();
																	var div_7 = $.first_child(fragment_11);
																	var node_16 = $.child(div_7);

																	UserCirclePlus(node_16, { class: 'text-foreground-alt mr-2 size-5' });
																	$.next();
																	$.reset(div_7);

																	var div_8 = $.sibling(div_7, 2);
																	var node_17 = $.child(div_8);

																	CaretRight(node_17, { class: 'text-foreground-alt size-5' });
																	$.reset(div_8);
																	$.append($$anchor, fragment_11);
																},
																$$slots: { default: true }
															});
														});

														var node_18 = $.sibling(node_15, 2);

														$.component(node_18, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
															DropdownMenu_SubContent($$anchor, {
																class: 'border-muted bg-background shadow-popover w-[209px] rounded-xl border px-1 py-1.5 focus-visible:outline-none',
																sideOffset: 10,
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = $.comment();
																	var node_19 = $.first_child(fragment_12);

																	$.component(node_19, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																		DropdownMenu_RadioGroup($$anchor, {
																			get value() {
																				return $.get(invited);
																			},

																			set value($$value) {
																				$.set(invited, $$value, true);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_13 = root_10();
																				var node_20 = $.first_child(fragment_13);

																				{
																					const children = ($$anchor, $$arg0) => {
																						let checked = () => ($$arg0?.()).checked;
																						var fragment_14 = root_6();
																						var node_21 = $.first_child(fragment_14);

																						$.component(node_21, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																							Avatar_Root($$anchor, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_15 = root_5();
																									var node_22 = $.first_child(fragment_15);

																									$.component(node_22, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																										Avatar_Image($$anchor, {
																											src: 'https://github.com/huntabyte.png',
																											alt: '@huntabyte',
																											class: 'aspect-square h-full w-full'
																										});
																									});

																									var node_23 = $.sibling(node_22, 2);

																									$.component(node_23, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																										Avatar_Fallback($$anchor, {
																											class: 'bg-muted text-xxs flex h-full w-full items-center justify-center rounded-full',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text = $.text('HJ');

																												$.append($$anchor, text);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_15);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_24 = $.sibling(node_21, 2);

																						{
																							var consequent_1 = ($$anchor) => {
																								DotOutline($$anchor, { class: 'ml-auto size-4' });
																							};

																							$.if(node_24, ($$render) => {
																								if (checked()) $$render(consequent_1);
																							});
																						}

																						$.append($$anchor, fragment_14);
																					};

																					$.component(node_20, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																						DropdownMenu_RadioItem($$anchor, {
																							value: 'huntabyte',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});
																					});
																				}

																				var node_25 = $.sibling(node_20, 2);

																				{
																					const children = ($$anchor, $$arg0) => {
																						let checked = () => ($$arg0?.()).checked;
																						var fragment_17 = root_7();
																						var node_26 = $.first_child(fragment_17);

																						$.component(node_26, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																							Avatar_Root_1($$anchor, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_18 = root_5();
																									var node_27 = $.first_child(fragment_18);

																									$.component(node_27, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																										Avatar_Image_1($$anchor, {
																											src: 'https://github.com/pavelstianko.png',
																											alt: '@pavel_stianko',
																											class: 'aspect-square h-full w-full'
																										});
																									});

																									var node_28 = $.sibling(node_27, 2);

																									$.component(node_28, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																										Avatar_Fallback_1($$anchor, {
																											class: 'bg-muted flex h-full w-full items-center justify-center rounded-full text-xs',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_1 = $.text('PS');

																												$.append($$anchor, text_1);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_18);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_29 = $.sibling(node_26, 2);

																						{
																							var consequent_2 = ($$anchor) => {
																								DotOutline($$anchor, { class: 'ml-auto size-4' });
																							};

																							$.if(node_29, ($$render) => {
																								if (checked()) $$render(consequent_2);
																							});
																						}

																						$.append($$anchor, fragment_17);
																					};

																					$.component(node_25, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																						DropdownMenu_RadioItem_1($$anchor, {
																							value: 'pavel',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});
																					});
																				}

																				var node_30 = $.sibling(node_25, 2);

																				{
																					const children = ($$anchor, $$arg0) => {
																						let checked = () => ($$arg0?.()).checked;
																						var fragment_20 = root_8();
																						var node_31 = $.first_child(fragment_20);

																						$.component(node_31, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
																							Avatar_Root_2($$anchor, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_21 = root_5();
																									var node_32 = $.first_child(fragment_21);

																									$.component(node_32, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
																										Avatar_Image_2($$anchor, {
																											src: 'https://github.com/adriangonz97.png',
																											alt: '@cokakoala_',
																											class: 'aspect-square h-full w-full'
																										});
																									});

																									var node_33 = $.sibling(node_32, 2);

																									$.component(node_33, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
																										Avatar_Fallback_2($$anchor, {
																											class: 'bg-muted flex h-full w-full items-center justify-center rounded-full text-xs',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text('CK');

																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_21);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_34 = $.sibling(node_31, 2);

																						{
																							var consequent_3 = ($$anchor) => {
																								DotOutline($$anchor, { class: 'ml-auto size-4' });
																							};

																							$.if(node_34, ($$render) => {
																								if (checked()) $$render(consequent_3);
																							});
																						}

																						$.append($$anchor, fragment_20);
																					};

																					$.component(node_30, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
																						DropdownMenu_RadioItem_2($$anchor, {
																							value: 'cokakoala',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});
																					});
																				}

																				var node_35 = $.sibling(node_30, 2);

																				{
																					const children = ($$anchor, $$arg0) => {
																						let checked = () => ($$arg0?.()).checked;
																						var fragment_23 = root_9();
																						var node_36 = $.first_child(fragment_23);

																						$.component(node_36, () => Avatar.Root, ($$anchor, Avatar_Root_3) => {
																							Avatar_Root_3($$anchor, {
																								class: 'border-foreground/50 relative mr-3 flex size-5 shrink-0 overflow-hidden rounded-full border',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_24 = root_5();
																									var node_37 = $.first_child(fragment_24);

																									$.component(node_37, () => Avatar.Image, ($$anchor, Avatar_Image_3) => {
																										Avatar_Image_3($$anchor, {
																											src: 'https://github.com/tglide.png',
																											alt: '@tglide',
																											class: 'aspect-square h-full w-full'
																										});
																									});

																									var node_38 = $.sibling(node_37, 2);

																									$.component(node_38, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_3) => {
																										Avatar_Fallback_3($$anchor, {
																											class: 'bg-muted flex h-full w-full items-center justify-center rounded-full text-xs',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_3 = $.text('TL');

																												$.append($$anchor, text_3);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_24);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_39 = $.sibling(node_36, 2);

																						{
																							var consequent_4 = ($$anchor) => {
																								DotOutline($$anchor, { class: 'ml-auto size-4' });
																							};

																							$.if(node_39, ($$render) => {
																								if (checked()) $$render(consequent_4);
																							});
																						}

																						$.append($$anchor, fragment_23);
																					};

																					$.component(node_35, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_3) => {
																						DropdownMenu_RadioItem_3($$anchor, {
																							value: 'tglide',
																							class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																							children,
																							$$slots: { default: true }
																						});
																					});
																				}

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

														$.append($$anchor, fragment_10);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_1);
											$.reset(div);
											$.transition(3, div_1, () => fly, () => ({ duration: 300 }));
											$.append($$anchor, div);
										};

										$.if(node_4, ($$render) => {
											if (open()) $$render(consequent_5);
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
									DropdownMenu_Content($$anchor, {
										class: 'border-muted bg-background shadow-popover w-[229px] rounded-xl border px-1 py-1.5 focus-visible:outline-none',
										sideOffset: 8,
										forceMount: true,
										child,
										$$slots: { child: true }
									});
								});
							}

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
}