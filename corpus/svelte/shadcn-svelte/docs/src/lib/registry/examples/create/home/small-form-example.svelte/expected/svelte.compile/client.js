import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setMode } from "mode-watcher";
import { tick } from "svelte";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span class="sr-only">More options</span>`, 1);
var root_1 = $.from_html(`<!> New File <!>`, 1);
var root_2 = $.from_html(`<!> New Folder <!>`, 1);
var root_3 = $.from_html(`<!> Open Recent`, 1);
var root_4 = $.from_html(`<!> Project Alpha`, 1);
var root_5 = $.from_html(`<!> Project Beta`, 1);
var root_6 = $.from_html(`<!> More Projects`, 1);
var root_7 = $.from_html(`<!> Project Gamma`, 1);
var root_8 = $.from_html(`<!> Project Delta`, 1);
var root_9 = $.from_html(`<!> <!>`, 1);
var root_10 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`<!> Browse...`, 1);
var root_12 = $.from_html(`<!> <!> <!>`, 1);
var root_13 = $.from_html(`<!> Save <!>`, 1);
var root_14 = $.from_html(`<!> Export <!>`, 1);
var root_15 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_16 = $.from_html(`<!> Show Sidebar`, 1);
var root_17 = $.from_html(`<!> Show Status Bar`, 1);
var root_18 = $.from_html(`<!> Theme`, 1);
var root_19 = $.from_html(`<!> Light`, 1);
var root_20 = $.from_html(`<!> Dark`, 1);
var root_21 = $.from_html(`<!> System`, 1);
var root_22 = $.from_html(`<!> Help & Support`, 1);
var root_23 = $.from_html(`<!> Documentation`, 1);
var root_24 = $.from_html(`<!> Sign Out <!>`, 1);
var root_25 = $.from_html(` <!>`, 1);
var root_26 = $.from_html(`<div class="grid grid-cols-2 gap-4"><!> <!></div> <!> <!> <!>`, 1);
var root_27 = $.from_html(`<form><!></form>`);

export default function Small_form_example($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];

	const roleItems = [
		{ label: "Developer", value: "developer" },
		{ label: "Designer", value: "designer" },
		{ label: "Manager", value: "manager" },
		{ label: "Other", value: "other" }
	];

	let notifications = $.state($.proxy({ email: true, sms: false, push: true }));
	let theme = "light";
	let frameworkOpen = $.state(false);
	let frameworkValue = $.state("");
	let role = $.state(undefined);
	let triggerRef = $.state(null);
	const selectedFramework = $.derived(() => frameworks.find((f) => f.toLowerCase() === $.get(frameworkValue)) || "");

	function closeAndFocusTrigger() {
		$.set(frameworkOpen, false);

		tick().then(() => {
			$.get(triggerRef).focus();
		});
	}

	const roleLabel = $.derived(() => roleItems.find((item) => item.value === $.get(role))?.label ?? "Select role");

	Example($$anchor, {
		title: 'Form',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-md',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_9();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_12();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('User Information');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Please fill in your details below');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
										Card_Action($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
													DropdownMenu_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_9();
															var node_6 = $.first_child(fragment_5);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;

																	Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root();
																			var node_7 = $.first_child(fragment_7);

																			IconPlaceholder(node_7, {
																				lucide: 'MoreVerticalIcon',
																				tabler: 'IconDotsVertical',
																				hugeicons: 'MoreVerticalCircle01Icon',
																				phosphor: 'DotsThreeVerticalIcon',
																				remixicon: 'RiMore2Line'
																			});

																			$.next(2);
																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	}));
																};

																$.component(node_6, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																	DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																});
															}

															var node_8 = $.sibling(node_6, 2);

															$.component(node_8, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																DropdownMenu_Content($$anchor, {
																	align: 'end',
																	class: 'style-vega:w-56 style-nova:w-48 style-lyra:w-48 style-maia:w-56 style-mira:w-48',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_15();
																		var node_9 = $.first_child(fragment_8);

																		$.component(node_9, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																			DropdownMenu_Group($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_15();
																					var node_10 = $.first_child(fragment_9);

																					$.component(node_10, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																						DropdownMenu_Label($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_2 = $.text('File');

																								$.append($$anchor, text_2);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_11 = $.sibling(node_10, 2);

																					$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																						DropdownMenu_Item($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_10 = root_1();
																								var node_12 = $.first_child(fragment_10);

																								IconPlaceholder(node_12, {
																									lucide: 'FileIcon',
																									tabler: 'IconFile',
																									hugeicons: 'FileIcon',
																									phosphor: 'FileIcon',
																									remixicon: 'RiFileLine'
																								});

																								var node_13 = $.sibling(node_12, 2);

																								$.component(node_13, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
																									DropdownMenu_Shortcut($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text('⌘N');

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

																					var node_14 = $.sibling(node_11, 2);

																					$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																						DropdownMenu_Item_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_11 = root_2();
																								var node_15 = $.first_child(fragment_11);

																								IconPlaceholder(node_15, {
																									lucide: 'FolderIcon',
																									tabler: 'IconFolder',
																									hugeicons: 'FolderIcon',
																									phosphor: 'FolderIcon',
																									remixicon: 'RiFolderLine'
																								});

																								var node_16 = $.sibling(node_15, 2);

																								$.component(node_16, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_1) => {
																									DropdownMenu_Shortcut_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text('⇧⌘N');

																											$.append($$anchor, text_4);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_17 = $.sibling(node_14, 2);

																					$.component(node_17, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
																						DropdownMenu_Sub($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = root_9();
																								var node_18 = $.first_child(fragment_12);

																								$.component(node_18, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
																									DropdownMenu_SubTrigger($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = root_3();
																											var node_19 = $.first_child(fragment_13);

																											IconPlaceholder(node_19, {
																												lucide: 'FolderOpenIcon',
																												tabler: 'IconFolderOpen',
																												hugeicons: 'FolderOpenIcon',
																												phosphor: 'FolderOpenIcon',
																												remixicon: 'RiFolderOpenLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_13);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_20 = $.sibling(node_18, 2);

																								$.component(node_20, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
																									DropdownMenu_Portal($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_14 = $.comment();
																											var node_21 = $.first_child(fragment_14);

																											$.component(node_21, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																												DropdownMenu_SubContent($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_15 = root_12();
																														var node_22 = $.first_child(fragment_15);

																														$.component(node_22, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																															DropdownMenu_Group_1($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_16 = root_10();
																																	var node_23 = $.first_child(fragment_16);

																																	$.component(node_23, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																																		DropdownMenu_Label_1($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_5 = $.text('Recent Projects');

																																				$.append($$anchor, text_5);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_24 = $.sibling(node_23, 2);

																																	$.component(node_24, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																																		DropdownMenu_Item_2($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_17 = root_4();
																																				var node_25 = $.first_child(fragment_17);

																																				IconPlaceholder(node_25, {
																																					lucide: 'FileCodeIcon',
																																					tabler: 'IconFileCode',
																																					hugeicons: 'CodeIcon',
																																					phosphor: 'CodeIcon',
																																					remixicon: 'RiFileCodeLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_17);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_26 = $.sibling(node_24, 2);

																																	$.component(node_26, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																																		DropdownMenu_Item_3($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_18 = root_5();
																																				var node_27 = $.first_child(fragment_18);

																																				IconPlaceholder(node_27, {
																																					lucide: 'FileCodeIcon',
																																					tabler: 'IconFileCode',
																																					hugeicons: 'CodeIcon',
																																					phosphor: 'CodeIcon',
																																					remixicon: 'RiFileCodeLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_18);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_28 = $.sibling(node_26, 2);

																																	$.component(node_28, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_1) => {
																																		DropdownMenu_Sub_1($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_19 = root_9();
																																				var node_29 = $.first_child(fragment_19);

																																				$.component(node_29, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_1) => {
																																					DropdownMenu_SubTrigger_1($$anchor, {
																																						children: ($$anchor, $$slotProps) => {
																																							var fragment_20 = root_6();
																																							var node_30 = $.first_child(fragment_20);

																																							IconPlaceholder(node_30, {
																																								lucide: 'MoreHorizontalIcon',
																																								tabler: 'IconDots',
																																								hugeicons: 'MoreHorizontalCircle01Icon',
																																								phosphor: 'DotsThreeOutlineIcon',
																																								remixicon: 'RiMoreLine'
																																							});

																																							$.next();
																																							$.append($$anchor, fragment_20);
																																						},
																																						$$slots: { default: true }
																																					});
																																				});

																																				var node_31 = $.sibling(node_29, 2);

																																				$.component(node_31, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_1) => {
																																					DropdownMenu_Portal_1($$anchor, {
																																						children: ($$anchor, $$slotProps) => {
																																							var fragment_21 = $.comment();
																																							var node_32 = $.first_child(fragment_21);

																																							$.component(node_32, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_1) => {
																																								DropdownMenu_SubContent_1($$anchor, {
																																									children: ($$anchor, $$slotProps) => {
																																										var fragment_22 = root_9();
																																										var node_33 = $.first_child(fragment_22);

																																										$.component(node_33, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																																											DropdownMenu_Item_4($$anchor, {
																																												children: ($$anchor, $$slotProps) => {
																																													var fragment_23 = root_7();
																																													var node_34 = $.first_child(fragment_23);

																																													IconPlaceholder(node_34, {
																																														lucide: 'FileCodeIcon',
																																														tabler: 'IconFileCode',
																																														hugeicons: 'CodeIcon',
																																														phosphor: 'CodeIcon',
																																														remixicon: 'RiFileCodeLine'
																																													});

																																													$.next();
																																													$.append($$anchor, fragment_23);
																																												},
																																												$$slots: { default: true }
																																											});
																																										});

																																										var node_35 = $.sibling(node_33, 2);

																																										$.component(node_35, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																																											DropdownMenu_Item_5($$anchor, {
																																												children: ($$anchor, $$slotProps) => {
																																													var fragment_24 = root_8();
																																													var node_36 = $.first_child(fragment_24);

																																													IconPlaceholder(node_36, {
																																														lucide: 'FileCodeIcon',
																																														tabler: 'IconFileCode',
																																														hugeicons: 'CodeIcon',
																																														phosphor: 'CodeIcon',
																																														remixicon: 'RiFileCodeLine'
																																													});

																																													$.next();
																																													$.append($$anchor, fragment_24);
																																												},
																																												$$slots: { default: true }
																																											});
																																										});

																																										$.append($$anchor, fragment_22);
																																									},
																																									$$slots: { default: true }
																																								});
																																							});

																																							$.append($$anchor, fragment_21);
																																						},
																																						$$slots: { default: true }
																																					});
																																				});

																																				$.append($$anchor, fragment_19);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	$.append($$anchor, fragment_16);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_37 = $.sibling(node_22, 2);

																														$.component(node_37, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																															DropdownMenu_Separator($$anchor, {});
																														});

																														var node_38 = $.sibling(node_37, 2);

																														$.component(node_38, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																															DropdownMenu_Group_2($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_25 = $.comment();
																																	var node_39 = $.first_child(fragment_25);

																																	$.component(node_39, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																																		DropdownMenu_Item_6($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_26 = root_11();
																																				var node_40 = $.first_child(fragment_26);

																																				IconPlaceholder(node_40, {
																																					lucide: 'FolderSearchIcon',
																																					tabler: 'IconFolderSearch',
																																					hugeicons: 'SearchIcon',
																																					phosphor: 'MagnifyingGlassIcon',
																																					remixicon: 'RiSearchLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_26);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	$.append($$anchor, fragment_25);
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

																								$.append($$anchor, fragment_12);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_41 = $.sibling(node_17, 2);

																					$.component(node_41, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																						DropdownMenu_Separator_1($$anchor, {});
																					});

																					var node_42 = $.sibling(node_41, 2);

																					$.component(node_42, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
																						DropdownMenu_Item_7($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_27 = root_13();
																								var node_43 = $.first_child(fragment_27);

																								IconPlaceholder(node_43, {
																									lucide: 'SaveIcon',
																									tabler: 'IconDeviceFloppy',
																									hugeicons: 'FloppyDiskIcon',
																									phosphor: 'FloppyDiskIcon',
																									remixicon: 'RiSaveLine'
																								});

																								var node_44 = $.sibling(node_43, 2);

																								$.component(node_44, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_2) => {
																									DropdownMenu_Shortcut_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_6 = $.text('⌘S');

																											$.append($$anchor, text_6);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_27);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_45 = $.sibling(node_42, 2);

																					$.component(node_45, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
																						DropdownMenu_Item_8($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_28 = root_14();
																								var node_46 = $.first_child(fragment_28);

																								IconPlaceholder(node_46, {
																									lucide: 'DownloadIcon',
																									tabler: 'IconDownload',
																									hugeicons: 'DownloadIcon',
																									phosphor: 'DownloadIcon',
																									remixicon: 'RiDownloadLine'
																								});

																								var node_47 = $.sibling(node_46, 2);

																								$.component(node_47, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_3) => {
																									DropdownMenu_Shortcut_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_7 = $.text('⇧⌘E');

																											$.append($$anchor, text_7);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_28);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_48 = $.sibling(node_9, 2);

																		$.component(node_48, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
																			DropdownMenu_Separator_2($$anchor, {});
																		});

																		var node_49 = $.sibling(node_48, 2);

																		$.component(node_49, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_3) => {
																			DropdownMenu_Group_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_29 = root_10();
																					var node_50 = $.first_child(fragment_29);

																					$.component(node_50, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_2) => {
																						DropdownMenu_Label_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_8 = $.text('View');

																								$.append($$anchor, text_8);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_51 = $.sibling(node_50, 2);

																					$.component(node_51, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
																						DropdownMenu_CheckboxItem($$anchor, {
																							get checked() {
																								return $.get(notifications).email;
																							},

																							onCheckedChange: (checked) => {
																								$.set(notifications, { ...$.get(notifications), email: checked === true }, true);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_30 = root_16();
																								var node_52 = $.first_child(fragment_30);

																								IconPlaceholder(node_52, {
																									lucide: 'EyeIcon',
																									tabler: 'IconEye',
																									hugeicons: 'EyeIcon',
																									phosphor: 'EyeIcon',
																									remixicon: 'RiEyeLine'
																								});

																								$.next();
																								$.append($$anchor, fragment_30);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_53 = $.sibling(node_51, 2);

																					$.component(node_53, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_1) => {
																						DropdownMenu_CheckboxItem_1($$anchor, {
																							get checked() {
																								return $.get(notifications).sms;
																							},

																							onCheckedChange: (checked) => {
																								$.set(notifications, { ...$.get(notifications), sms: checked === true }, true);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_31 = root_17();
																								var node_54 = $.first_child(fragment_31);

																								IconPlaceholder(node_54, {
																									lucide: 'LayoutIcon',
																									tabler: 'IconLayout',
																									hugeicons: 'LayoutIcon',
																									phosphor: 'LayoutIcon',
																									remixicon: 'RiLayoutLine'
																								});

																								$.next();
																								$.append($$anchor, fragment_31);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_55 = $.sibling(node_53, 2);

																					$.component(node_55, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_2) => {
																						DropdownMenu_Sub_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_32 = root_9();
																								var node_56 = $.first_child(fragment_32);

																								$.component(node_56, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_2) => {
																									DropdownMenu_SubTrigger_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_33 = root_18();
																											var node_57 = $.first_child(fragment_33);

																											IconPlaceholder(node_57, {
																												lucide: 'PaletteIcon',
																												tabler: 'IconPalette',
																												hugeicons: 'PaintBoardIcon',
																												phosphor: 'PaletteIcon',
																												remixicon: 'RiPaletteLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_33);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_58 = $.sibling(node_56, 2);

																								$.component(node_58, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_2) => {
																									DropdownMenu_Portal_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_34 = $.comment();
																											var node_59 = $.first_child(fragment_34);

																											$.component(node_59, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_2) => {
																												DropdownMenu_SubContent_2($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_35 = $.comment();
																														var node_60 = $.first_child(fragment_35);

																														$.component(node_60, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_4) => {
																															DropdownMenu_Group_4($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_36 = root_9();
																																	var node_61 = $.first_child(fragment_36);

																																	$.component(node_61, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_3) => {
																																		DropdownMenu_Label_3($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_9 = $.text('Appearance');

																																				$.append($$anchor, text_9);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_62 = $.sibling(node_61, 2);

																																	$.component(node_62, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																																		DropdownMenu_RadioGroup($$anchor, {
																																			value: theme,
																																			onValueChange: (value) => {
																																				setMode(value);
																																			},

																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_37 = root_12();
																																				var node_63 = $.first_child(fragment_37);

																																				$.component(node_63, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																																					DropdownMenu_RadioItem($$anchor, {
																																						value: 'light',
																																						children: ($$anchor, $$slotProps) => {
																																							var fragment_38 = root_19();
																																							var node_64 = $.first_child(fragment_38);

																																							IconPlaceholder(node_64, {
																																								lucide: 'SunIcon',
																																								tabler: 'IconSun',
																																								hugeicons: 'SunIcon',
																																								phosphor: 'SunIcon',
																																								remixicon: 'RiSunLine'
																																							});

																																							$.next();
																																							$.append($$anchor, fragment_38);
																																						},
																																						$$slots: { default: true }
																																					});
																																				});

																																				var node_65 = $.sibling(node_63, 2);

																																				$.component(node_65, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																																					DropdownMenu_RadioItem_1($$anchor, {
																																						value: 'dark',
																																						children: ($$anchor, $$slotProps) => {
																																							var fragment_39 = root_20();
																																							var node_66 = $.first_child(fragment_39);

																																							IconPlaceholder(node_66, {
																																								lucide: 'MoonIcon',
																																								tabler: 'IconMoon',
																																								hugeicons: 'MoonIcon',
																																								phosphor: 'MoonIcon',
																																								remixicon: 'RiMoonLine'
																																							});

																																							$.next();
																																							$.append($$anchor, fragment_39);
																																						},
																																						$$slots: { default: true }
																																					});
																																				});

																																				var node_67 = $.sibling(node_65, 2);

																																				$.component(node_67, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
																																					DropdownMenu_RadioItem_2($$anchor, {
																																						value: 'system',
																																						children: ($$anchor, $$slotProps) => {
																																							var fragment_40 = root_21();
																																							var node_68 = $.first_child(fragment_40);

																																							IconPlaceholder(node_68, {
																																								lucide: 'MonitorIcon',
																																								tabler: 'IconDeviceDesktop',
																																								hugeicons: 'ComputerIcon',
																																								phosphor: 'MonitorIcon',
																																								remixicon: 'RiComputerLine'
																																							});

																																							$.next();
																																							$.append($$anchor, fragment_40);
																																						},
																																						$$slots: { default: true }
																																					});
																																				});

																																				$.append($$anchor, fragment_37);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	$.append($$anchor, fragment_36);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_35);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_34);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_32);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_29);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_69 = $.sibling(node_49, 2);

																		$.component(node_69, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_3) => {
																			DropdownMenu_Separator_3($$anchor, {});
																		});

																		var node_70 = $.sibling(node_69, 2);

																		$.component(node_70, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_5) => {
																			DropdownMenu_Group_5($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_41 = root_9();
																					var node_71 = $.first_child(fragment_41);

																					$.component(node_71, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_9) => {
																						DropdownMenu_Item_9($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_42 = root_22();
																								var node_72 = $.first_child(fragment_42);

																								IconPlaceholder(node_72, {
																									lucide: 'HelpCircleIcon',
																									tabler: 'IconHelpCircle',
																									hugeicons: 'HelpCircleIcon',
																									phosphor: 'QuestionIcon',
																									remixicon: 'RiQuestionLine'
																								});

																								$.next();
																								$.append($$anchor, fragment_42);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_73 = $.sibling(node_71, 2);

																					$.component(node_73, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_10) => {
																						DropdownMenu_Item_10($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_43 = root_23();
																								var node_74 = $.first_child(fragment_43);

																								IconPlaceholder(node_74, {
																									lucide: 'FileTextIcon',
																									tabler: 'IconFileText',
																									hugeicons: 'File01Icon',
																									phosphor: 'FileTextIcon',
																									remixicon: 'RiFileTextLine'
																								});

																								$.next();
																								$.append($$anchor, fragment_43);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_41);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_75 = $.sibling(node_70, 2);

																		$.component(node_75, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_4) => {
																			DropdownMenu_Separator_4($$anchor, {});
																		});

																		var node_76 = $.sibling(node_75, 2);

																		$.component(node_76, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_6) => {
																			DropdownMenu_Group_6($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_44 = $.comment();
																					var node_77 = $.first_child(fragment_44);

																					$.component(node_77, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_11) => {
																						DropdownMenu_Item_11($$anchor, {
																							variant: 'destructive',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_45 = root_24();
																								var node_78 = $.first_child(fragment_45);

																								IconPlaceholder(node_78, {
																									lucide: 'LogOutIcon',
																									tabler: 'IconLogout',
																									hugeicons: 'LogoutIcon',
																									phosphor: 'SignOutIcon',
																									remixicon: 'RiLogoutBoxLine'
																								});

																								var node_79 = $.sibling(node_78, 2);

																								$.component(node_79, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_4) => {
																									DropdownMenu_Shortcut_4($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_10 = $.text('⇧⌘Q');

																											$.append($$anchor, text_10);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_45);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_44);
																				},
																				$$slots: { default: true }
																			});
																		});

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_80 = $.sibling(node_1, 2);

						$.component(node_80, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_27();
									var node_81 = $.child(form);

									$.component(node_81, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_46 = root_26();
												var div = $.first_child(fragment_46);
												var node_82 = $.child(div);

												$.component(node_82, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_47 = root_9();
															var node_83 = $.first_child(fragment_47);

															$.component(node_83, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'small-form-name',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('Name');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});
															});

															var node_84 = $.sibling(node_83, 2);

															Input(node_84, {
																id: 'small-form-name',
																placeholder: 'Enter your name',
																required: true
															});

															$.append($$anchor, fragment_47);
														},
														$$slots: { default: true }
													});
												});

												var node_85 = $.sibling(node_82, 2);

												$.component(node_85, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_48 = root_9();
															var node_86 = $.first_child(fragment_48);

															$.component(node_86, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'small-form-role',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('Role');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { default: true }
																});
															});

															var node_87 = $.sibling(node_86, 2);

															$.component(node_87, () => Select.Root, ($$anchor, Select_Root) => {
																Select_Root($$anchor, {
																	type: 'single',
																	get value() {
																		return $.get(role);
																	},

																	set value($$value) {
																		$.set(role, $$value, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_49 = root_9();
																		var node_88 = $.first_child(fragment_49);

																		$.component(node_88, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																			Select_Trigger($$anchor, {
																				id: 'small-form-role',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_13 = $.text();

																					$.template_effect(() => $.set_text(text_13, $.get(roleLabel)));
																					$.append($$anchor, text_13);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_89 = $.sibling(node_88, 2);

																		$.component(node_89, () => Select.Content, ($$anchor, Select_Content) => {
																			Select_Content($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_51 = $.comment();
																					var node_90 = $.first_child(fragment_51);

																					$.component(node_90, () => Select.Group, ($$anchor, Select_Group) => {
																						Select_Group($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_52 = $.comment();
																								var node_91 = $.first_child(fragment_52);

																								$.each(node_91, 17, () => roleItems, (item) => item.value, ($$anchor, item) => {
																									var fragment_53 = $.comment();
																									var node_92 = $.first_child(fragment_53);

																									$.component(node_92, () => Select.Item, ($$anchor, Select_Item) => {
																										Select_Item($$anchor, {
																											get value() {
																												return $.get(item).value;
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_14 = $.text();

																												$.template_effect(() => $.set_text(text_14, $.get(item).label));
																												$.append($$anchor, text_14);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_53);
																								});

																								$.append($$anchor, fragment_52);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_51);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_49);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_48);
														},
														$$slots: { default: true }
													});
												});

												$.reset(div);

												var node_93 = $.sibling(div, 2);

												$.component(node_93, () => Field.Field, ($$anchor, Field_Field_2) => {
													Field_Field_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_55 = root_9();
															var node_94 = $.first_child(fragment_55);

															$.component(node_94, () => Field.Label, ($$anchor, Field_Label_2) => {
																Field_Label_2($$anchor, {
																	for: 'small-form-framework',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_15 = $.text('Framework');

																		$.append($$anchor, text_15);
																	},
																	$$slots: { default: true }
																});
															});

															var node_95 = $.sibling(node_94, 2);

															$.component(node_95, () => Popover.Root, ($$anchor, Popover_Root) => {
																Popover_Root($$anchor, {
																	get open() {
																		return $.get(frameworkOpen);
																	},

																	set open($$value) {
																		$.set(frameworkOpen, $$value, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_56 = root_9();
																		var node_96 = $.first_child(fragment_56);

																		{
																			let $0 = $.derived(() => cn(buttonVariants({ variant: "outline" }), "w-full justify-between", !$.get(frameworkValue) && "text-muted-foreground"));

																			$.component(node_96, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																				Popover_Trigger($$anchor, {
																					role: 'combobox',
																					get class() {
																						return $.get($0);
																					},

																					get ref() {
																						return $.get(triggerRef);
																					},

																					set ref($$value) {
																						$.set(triggerRef, $$value, true);
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var fragment_57 = root_25();
																						var text_16 = $.first_child(fragment_57);
																						var node_97 = $.sibling(text_16);

																						IconPlaceholder(node_97, {
																							lucide: 'ChevronDownIcon',
																							tabler: 'IconSelector',
																							hugeicons: 'UnfoldMoreIcon',
																							phosphor: 'CaretDownIcon',
																							remixicon: 'RiArrowDownSLine'
																						});

																						$.template_effect(() => $.set_text(text_16, `${($.get(selectedFramework) || "Select a framework") ?? ''} `));
																						$.append($$anchor, fragment_57);
																					},
																					$$slots: { default: true }
																				});
																			});
																		}

																		var node_98 = $.sibling(node_96, 2);

																		$.component(node_98, () => Popover.Content, ($$anchor, Popover_Content) => {
																			Popover_Content($$anchor, {
																				class: 'w-(--bits-popover-anchor-width) p-0',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_58 = $.comment();
																					var node_99 = $.first_child(fragment_58);

																					$.component(node_99, () => Command.Root, ($$anchor, Command_Root) => {
																						Command_Root($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_59 = root_12();
																								var node_100 = $.first_child(fragment_59);

																								$.component(node_100, () => Command.Input, ($$anchor, Command_Input) => {
																									Command_Input($$anchor, { autofocus: true, placeholder: 'Search framework...' });
																								});

																								var node_101 = $.sibling(node_100, 2);

																								$.component(node_101, () => Command.Empty, ($$anchor, Command_Empty) => {
																									Command_Empty($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_17 = $.text('No frameworks found.');

																											$.append($$anchor, text_17);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_102 = $.sibling(node_101, 2);

																								$.component(node_102, () => Command.List, ($$anchor, Command_List) => {
																									Command_List($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_60 = $.comment();
																											var node_103 = $.first_child(fragment_60);

																											$.component(node_103, () => Command.Group, ($$anchor, Command_Group) => {
																												Command_Group($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_61 = $.comment();
																														var node_104 = $.first_child(fragment_61);

																														$.each(node_104, 16, () => frameworks, (framework) => framework, ($$anchor, framework) => {
																															var fragment_62 = $.comment();
																															var node_105 = $.first_child(fragment_62);

																															{
																																let $0 = $.derived(() => $.get(frameworkValue) === framework.toLowerCase());

																																$.component(node_105, () => Command.Item, ($$anchor, Command_Item) => {
																																	Command_Item($$anchor, {
																																		get value() {
																																			return framework;
																																		},

																																		get 'data-checked'() {
																																			return $.get($0);
																																		},

																																		onSelect: () => {
																																			$.set(frameworkValue, framework.toLowerCase(), true);
																																			closeAndFocusTrigger();
																																		},

																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_18 = $.text();

																																			$.template_effect(() => $.set_text(text_18, framework));
																																			$.append($$anchor, text_18);
																																		},
																																		$$slots: { default: true }
																																	});
																																});
																															}

																															$.append($$anchor, fragment_62);
																														});

																														$.append($$anchor, fragment_61);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_60);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_59);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_58);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_56);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_55);
														},
														$$slots: { default: true }
													});
												});

												var node_106 = $.sibling(node_93, 2);

												$.component(node_106, () => Field.Field, ($$anchor, Field_Field_3) => {
													Field_Field_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_64 = root_9();
															var node_107 = $.first_child(fragment_64);

															$.component(node_107, () => Field.Label, ($$anchor, Field_Label_3) => {
																Field_Label_3($$anchor, {
																	for: 'small-form-comments',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_19 = $.text('Comments');

																		$.append($$anchor, text_19);
																	},
																	$$slots: { default: true }
																});
															});

															var node_108 = $.sibling(node_107, 2);

															Textarea(node_108, {
																id: 'small-form-comments',
																placeholder: 'Add any additional comments'
															});

															$.append($$anchor, fragment_64);
														},
														$$slots: { default: true }
													});
												});

												var node_109 = $.sibling(node_106, 2);

												$.component(node_109, () => Field.Field, ($$anchor, Field_Field_4) => {
													Field_Field_4($$anchor, {
														orientation: 'horizontal',
														children: ($$anchor, $$slotProps) => {
															var fragment_65 = root_9();
															var node_110 = $.first_child(fragment_65);

															Button(node_110, {
																type: 'submit',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_20 = $.text('Submit');

																	$.append($$anchor, text_20);
																},
																$$slots: { default: true }
															});

															var node_111 = $.sibling(node_110, 2);

															Button(node_111, {
																variant: 'outline',
																type: 'button',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_21 = $.text('Cancel');

																	$.append($$anchor, text_21);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_65);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_46);
											},
											$$slots: { default: true }
										});
									});

									$.reset(form);
									$.append($$anchor, form);
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

	$.pop();
}