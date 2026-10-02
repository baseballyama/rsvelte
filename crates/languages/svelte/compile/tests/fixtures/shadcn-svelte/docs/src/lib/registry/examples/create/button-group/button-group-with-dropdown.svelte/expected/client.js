import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Mute Conversation`, 1);
var root_2 = $.from_html(`<!> Mark as Read`, 1);
var root_3 = $.from_html(`<!> Report Conversation`, 1);
var root_4 = $.from_html(`<!> Block User`, 1);
var root_5 = $.from_html(`<!> Share Conversation`, 1);
var root_6 = $.from_html(`<!> Copy Conversation`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> Delete Conversation`, 1);
var root_9 = $.from_html(`<!> <!> <!>`, 1);
var root_10 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Button_group_with_dropdown($$anchor) {
	Example($$anchor, {
		title: 'With Dropdown',
		children: ($$anchor, $$slotProps) => {
			var div = root_10();
			var node = $.child(div);

			ButtonGroup(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Button(node_1, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Update');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
						DropdownMenu_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_3 = $.first_child(fragment_2);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;

										Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'ChevronDownIcon',
													tabler: 'IconChevronDown',
													hugeicons: 'ArrowDown01Icon',
													phosphor: 'CaretDownIcon',
													remixicon: 'RiArrowDownSLine'
												});
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
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_5 = $.first_child(fragment_5);

											$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
												DropdownMenu_Item($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Disable');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
												DropdownMenu_Item_1($$anchor, {
													variant: 'destructive',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Uninstall');

														$.append($$anchor, text_2);
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

			var node_7 = $.sibling(node, 2);

			ButtonGroup(node_7, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_8 = $.first_child(fragment_6);

					Button(node_8, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Follow');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
						DropdownMenu_Root_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_10 = $.first_child(fragment_7);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;

										Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'ChevronDownIcon',
													tabler: 'IconChevronDown',
													hugeicons: 'ArrowDown01Icon',
													phosphor: 'CaretDownIcon',
													remixicon: 'RiArrowDownSLine'
												});
											},
											$$slots: { default: true }
										}));
									};

									$.component(node_10, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
										DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
									});
								}

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
									DropdownMenu_Content_1($$anchor, {
										align: 'end',
										class: 'w-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_9();
											var node_12 = $.first_child(fragment_10);

											$.component(node_12, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
												DropdownMenu_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_11 = root_7();
														var node_13 = $.first_child(fragment_11);

														$.component(node_13, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
															DropdownMenu_Item_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = root_1();
																	var node_14 = $.first_child(fragment_12);

																	IconPlaceholder(node_14, {
																		lucide: 'VolumeX',
																		tabler: 'IconVolume',
																		hugeicons: 'VolumeOffIcon',
																		phosphor: 'SpeakerSlashIcon',
																		remixicon: 'RiVolumeMuteLine'
																	});

																	$.next();
																	$.append($$anchor, fragment_12);
																},
																$$slots: { default: true }
															});
														});

														var node_15 = $.sibling(node_13, 2);

														$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
															DropdownMenu_Item_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_13 = root_2();
																	var node_16 = $.first_child(fragment_13);

																	IconPlaceholder(node_16, {
																		lucide: 'CheckIcon',
																		tabler: 'IconCheck',
																		hugeicons: 'Tick02Icon',
																		phosphor: 'CheckIcon',
																		remixicon: 'RiCheckLine'
																	});

																	$.next();
																	$.append($$anchor, fragment_13);
																},
																$$slots: { default: true }
															});
														});

														var node_17 = $.sibling(node_15, 2);

														$.component(node_17, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
															DropdownMenu_Item_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_14 = root_3();
																	var node_18 = $.first_child(fragment_14);

																	IconPlaceholder(node_18, {
																		lucide: 'AlertTriangleIcon',
																		tabler: 'IconAlertTriangle',
																		hugeicons: 'AlertCircleIcon',
																		phosphor: 'WarningIcon',
																		remixicon: 'RiErrorWarningLine'
																	});

																	$.next();
																	$.append($$anchor, fragment_14);
																},
																$$slots: { default: true }
															});
														});

														var node_19 = $.sibling(node_17, 2);

														$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
															DropdownMenu_Item_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_15 = root_4();
																	var node_20 = $.first_child(fragment_15);

																	IconPlaceholder(node_20, {
																		lucide: 'UserRoundXIcon',
																		tabler: 'IconUserX',
																		hugeicons: 'UserRemove01Icon',
																		phosphor: 'UserMinusIcon',
																		remixicon: 'RiUserUnfollowLine'
																	});

																	$.next();
																	$.append($$anchor, fragment_15);
																},
																$$slots: { default: true }
															});
														});

														var node_21 = $.sibling(node_19, 2);

														$.component(node_21, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
															DropdownMenu_Item_6($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_16 = root_5();
																	var node_22 = $.first_child(fragment_16);

																	IconPlaceholder(node_22, {
																		lucide: 'ShareIcon',
																		tabler: 'IconShare',
																		hugeicons: 'Share03Icon',
																		phosphor: 'ShareIcon',
																		remixicon: 'RiShareLine'
																	});

																	$.next();
																	$.append($$anchor, fragment_16);
																},
																$$slots: { default: true }
															});
														});

														var node_23 = $.sibling(node_21, 2);

														$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
															DropdownMenu_Item_7($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_17 = root_6();
																	var node_24 = $.first_child(fragment_17);

																	IconPlaceholder(node_24, {
																		lucide: 'CopyIcon',
																		tabler: 'IconCopy',
																		hugeicons: 'Copy01Icon',
																		phosphor: 'CopyIcon',
																		remixicon: 'RiFileCopyLine'
																	});

																	$.next();
																	$.append($$anchor, fragment_17);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_11);
													},
													$$slots: { default: true }
												});
											});

											var node_25 = $.sibling(node_12, 2);

											$.component(node_25, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
												DropdownMenu_Separator($$anchor, {});
											});

											var node_26 = $.sibling(node_25, 2);

											$.component(node_26, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
												DropdownMenu_Group_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_18 = $.comment();
														var node_27 = $.first_child(fragment_18);

														$.component(node_27, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
															DropdownMenu_Item_8($$anchor, {
																variant: 'destructive',
																children: ($$anchor, $$slotProps) => {
																	var fragment_19 = root_8();
																	var node_28 = $.first_child(fragment_19);

																	IconPlaceholder(node_28, {
																		lucide: 'TrashIcon',
																		tabler: 'IconTrash',
																		hugeicons: 'Delete02Icon',
																		phosphor: 'TrashIcon',
																		remixicon: 'RiDeleteBinLine'
																	});

																	$.next();
																	$.append($$anchor, fragment_19);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_18);
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

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}