import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import Button from "$lib/registry/ui/button/button.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col space-y-1"><p class="text-sm leading-none font-medium">shadcn</p> <p class="text-xs leading-none text-muted-foreground">m@example.com</p></div>`);
var root_2 = $.from_html(`Profile <!>`, 1);
var root_3 = $.from_html(`Billing <!>`, 1);
var root_4 = $.from_html(`Settings <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`Log out <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function User_nav($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'ghost',
							class: 'relative size-8 rounded-full',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
									Avatar_Root($$anchor, {
										class: 'size-9',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
												Avatar_Image($$anchor, { src: '/avatars/01.png', alt: '@shadcn' });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
												Avatar_Fallback($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('SC');

														$.append($$anchor, text);
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
						}));
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'w-56',
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_7();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
											DropdownMenu_Label($$anchor, {
												class: 'font-normal',
												children: ($$anchor, $$slotProps) => {
													var div = root_1();

													$.append($$anchor, div);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
											DropdownMenu_Separator($$anchor, {});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
											DropdownMenu_Group_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_5();
													var node_10 = $.first_child(fragment_7);

													$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_8 = root_2();
																var node_11 = $.sibling($.first_child(fragment_8));

																$.component(node_11, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
																	DropdownMenu_Shortcut($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('⇧⌘P');

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

													var node_12 = $.sibling(node_10, 2);

													$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
														DropdownMenu_Item_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_9 = root_3();
																var node_13 = $.sibling($.first_child(fragment_9));

																$.component(node_13, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_1) => {
																	DropdownMenu_Shortcut_1($$anchor, {
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

													var node_14 = $.sibling(node_12, 2);

													$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
														DropdownMenu_Item_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_10 = root_4();
																var node_15 = $.sibling($.first_child(fragment_10));

																$.component(node_15, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_2) => {
																	DropdownMenu_Shortcut_2($$anchor, {
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

													var node_16 = $.sibling(node_14, 2);

													$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
														DropdownMenu_Item_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('New Team');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_9, 2);

										$.component(node_17, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
											DropdownMenu_Separator_1($$anchor, {});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
											DropdownMenu_Item_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_11 = root_6();
													var node_19 = $.sibling($.first_child(fragment_11));

													$.component(node_19, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_3) => {
														DropdownMenu_Shortcut_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('⇧⌘Q');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}