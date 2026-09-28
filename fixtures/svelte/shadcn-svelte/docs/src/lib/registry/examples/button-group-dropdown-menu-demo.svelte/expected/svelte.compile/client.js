import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import Share from "@lucide/svelte/icons/share";
import Trash from "@lucide/svelte/icons/trash";
import UserRoundX from "@lucide/svelte/icons/user-round-x";
import VolumeOff from "@lucide/svelte/icons/volume-off";
import CheckIcon from "@tabler/icons-svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> Mute Conversation`, 1);
var root_1 = $.from_html(`<!> Mark as Read`, 1);
var root_2 = $.from_html(`<!> Report Conversation`, 1);
var root_3 = $.from_html(`<!> Block User`, 1);
var root_4 = $.from_html(`<!> Share Conversation`, 1);
var root_5 = $.from_html(`<!> Copy Conversation`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> Delete Conversation`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> <!>`, 1);

export default function Button_group_dropdown_menu_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_9();
				var node_1 = $.first_child(fragment_1);

				Button(node_1, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Follow');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
					DropdownMenu_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_9();
							var node_3 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props(props, {
										variant: 'outline',
										class: '!ps-2',
										children: ($$anchor, $$slotProps) => {
											ChevronDown($$anchor, {});
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
									DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									align: 'end',
									class: '[--radius:1rem]',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_8();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
											DropdownMenu_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_6();
													var node_6 = $.first_child(fragment_6);

													$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_7 = $.first_child(fragment_7);

																VolumeOff(node_7, {});
																$.next();
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_6, 2);

													$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
														DropdownMenu_Item_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_1();
																var node_9 = $.first_child(fragment_8);

																CheckIcon(node_9, {});
																$.next();
																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_8, 2);

													$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
														DropdownMenu_Item_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root_2();
																var node_11 = $.first_child(fragment_9);

																AlertTriangle(node_11, {});
																$.next();
																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_10, 2);

													$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
														DropdownMenu_Item_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_3();
																var node_13 = $.first_child(fragment_10);

																UserRoundX(node_13, {});
																$.next();
																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_12, 2);

													$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
														DropdownMenu_Item_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root_4();
																var node_15 = $.first_child(fragment_11);

																Share(node_15, {});
																$.next();
																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_14, 2);

													$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
														DropdownMenu_Item_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = root_5();
																var node_17 = $.first_child(fragment_12);

																CopyIcon(node_17, {});
																$.next();
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

										var node_18 = $.sibling(node_5, 2);

										$.component(node_18, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
											DropdownMenu_Separator($$anchor, {});
										});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
											DropdownMenu_Group_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = $.comment();
													var node_20 = $.first_child(fragment_13);

													$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
														DropdownMenu_Item_6($$anchor, {
															variant: 'destructive',
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = root_7();
																var node_21 = $.first_child(fragment_14);

																Trash(node_21, {});
																$.next();
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
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}