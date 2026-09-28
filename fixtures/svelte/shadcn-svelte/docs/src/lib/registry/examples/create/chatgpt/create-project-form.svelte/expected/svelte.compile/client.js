import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Alert, AlertDescription } from "$lib/registry/ui/alert/index.js";
import { badgeVariants } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span class="sr-only">Memory</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="size-5 rounded-full bg-(--color) ring-2 ring-transparent ring-offset-2 ring-offset-(--color) group-data-[checked=true]/button:ring-(--color) group-data-[checked=true]/button:ring-offset-background"></span> <span class="sr-only"> </span>`, 1);
var root_4 = $.from_html(`<div class="flex flex-wrap gap-2"></div>`);
var root_5 = $.from_html(`<button type="button"><!> </button>`);

export default function Create_project_form($$anchor, $$props) {
	$.push($$props, true);

	const categories = [
		{ id: "homework", label: "Homework" },
		{ id: "writing", label: "Writing" },
		{ id: "health", label: "Health" },
		{ id: "travel", label: "Travel" }
	];

	let projectName = $.state("");
	let selectedCategory = $.state($.proxy(categories[0].id));
	let memorySetting = $.state("default");
	let selectedColor = $.state("var(--foreground)");

	Example($$anchor, {
		title: 'Create Project',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Create Project');

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

												var text_1 = $.text('Start a new project to keep chats, files, and custom instructions in one place.');

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
															var fragment_5 = root_1();
															var node_6 = $.first_child(fragment_5);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;

																	Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root();
																			var node_7 = $.first_child(fragment_7);

																			IconPlaceholder(node_7, {
																				lucide: 'SettingsIcon',
																				tabler: 'IconSettings',
																				hugeicons: 'Settings01Icon',
																				phosphor: 'GearIcon',
																				remixicon: 'RiSettingsLine'
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
																	class: 'w-72',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_2();
																		var node_9 = $.first_child(fragment_8);

																		$.component(node_9, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																			DropdownMenu_Group($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = $.comment();
																					var node_10 = $.first_child(fragment_9);

																					$.component(node_10, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																						DropdownMenu_RadioGroup($$anchor, {
																							get value() {
																								return $.get(memorySetting);
																							},

																							set value($$value) {
																								$.set(memorySetting, $$value, true);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_10 = root_1();
																								var node_11 = $.first_child(fragment_10);

																								$.component(node_11, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																									DropdownMenu_RadioItem($$anchor, {
																										value: 'default',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_11 = $.comment();
																											var node_12 = $.first_child(fragment_11);

																											$.component(node_12, () => Item.Root, ($$anchor, Item_Root) => {
																												Item_Root($$anchor, {
																													size: 'xs',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_12 = $.comment();
																														var node_13 = $.first_child(fragment_12);

																														$.component(node_13, () => Item.Content, ($$anchor, Item_Content) => {
																															Item_Content($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_13 = root_1();
																																	var node_14 = $.first_child(fragment_13);

																																	$.component(node_14, () => Item.Title, ($$anchor, Item_Title) => {
																																		Item_Title($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_2 = $.text('Default');

																																				$.append($$anchor, text_2);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_15 = $.sibling(node_14, 2);

																																	$.component(node_15, () => Item.Description, ($$anchor, Item_Description) => {
																																		Item_Description($$anchor, {
																																			class: 'text-xs',
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_3 = $.text('Project can access memories from outside chats, and vice versa.');

																																				$.append($$anchor, text_3);
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

																											$.append($$anchor, fragment_11);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_16 = $.sibling(node_11, 2);

																								$.component(node_16, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																									DropdownMenu_RadioItem_1($$anchor, {
																										value: 'project-only',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_14 = $.comment();
																											var node_17 = $.first_child(fragment_14);

																											$.component(node_17, () => Item.Root, ($$anchor, Item_Root_1) => {
																												Item_Root_1($$anchor, {
																													size: 'xs',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_15 = $.comment();
																														var node_18 = $.first_child(fragment_15);

																														$.component(node_18, () => Item.Content, ($$anchor, Item_Content_1) => {
																															Item_Content_1($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_16 = root_1();
																																	var node_19 = $.first_child(fragment_16);

																																	$.component(node_19, () => Item.Title, ($$anchor, Item_Title_1) => {
																																		Item_Title_1($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_4 = $.text('Project Only');

																																				$.append($$anchor, text_4);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_20 = $.sibling(node_19, 2);

																																	$.component(node_20, () => Item.Description, ($$anchor, Item_Description_1) => {
																																		Item_Description_1($$anchor, {
																																			class: 'text-xs',
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_5 = $.text('Project can only access its own memories. Its memories are hidden from\n												outside chats.');

																																				$.append($$anchor, text_5);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	$.append($$anchor, fragment_16);
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

																		var node_21 = $.sibling(node_9, 2);

																		$.component(node_21, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																			DropdownMenu_Separator($$anchor, {});
																		});

																		var node_22 = $.sibling(node_21, 2);

																		$.component(node_22, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																			DropdownMenu_Group_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_17 = $.comment();
																					var node_23 = $.first_child(fragment_17);

																					$.component(node_23, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																						DropdownMenu_Label($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('Note that this setting can\'t be changed later.');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_17);
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

						var node_24 = $.sibling(node_1, 2);

						$.component(node_24, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = $.comment();
									var node_25 = $.first_child(fragment_18);

									$.component(node_25, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = root_1();
												var node_26 = $.first_child(fragment_19);

												$.component(node_26, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_20 = root_2();
															var node_27 = $.first_child(fragment_20);

															$.component(node_27, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'project-name',
																	class: 'sr-only',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Project Name');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_28 = $.sibling(node_27, 2);

															$.component(node_28, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																InputGroup_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = root_1();
																		var node_29 = $.first_child(fragment_21);

																		$.component(node_29, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																			InputGroup_Input($$anchor, {
																				id: 'project-name',
																				placeholder: 'Copenhagen Trip',
																				get value() {
																					return $.get(projectName);
																				},

																				oninput: (e) => {
																					$.set(projectName, e.currentTarget.value, true);
																				}
																			});
																		});

																		var node_30 = $.sibling(node_29, 2);

																		$.component(node_30, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																			InputGroup_Addon($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_22 = $.comment();
																					var node_31 = $.first_child(fragment_22);

																					$.component(node_31, () => Popover.Root, ($$anchor, Popover_Root) => {
																						Popover_Root($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_23 = root_1();
																								var node_32 = $.first_child(fragment_23);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var fragment_24 = $.comment();
																										var node_33 = $.first_child(fragment_24);

																										$.component(node_33, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																											InputGroup_Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-xs' }, props, {
																												children: ($$anchor, $$slotProps) => {
																													{
																														let $0 = $.derived(() => `--color: ${$.get(selectedColor)}`);

																														IconPlaceholder($$anchor, {
																															get style() {
																																return $.get($0);
																															},
																															lucide: 'FolderIcon',
																															tabler: 'IconFolder',
																															hugeicons: 'FolderIcon',
																															phosphor: 'FolderIcon',
																															remixicon: 'RiFolderLine',
																															class: 'text-(--color)'
																														});
																													}
																												},
																												$$slots: { default: true }
																											}));
																										});

																										$.append($$anchor, fragment_24);
																									};

																									$.component(node_32, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																										Popover_Trigger($$anchor, { child, $$slots: { child: true } });
																									});
																								}

																								var node_34 = $.sibling(node_32, 2);

																								$.component(node_34, () => Popover.Content, ($$anchor, Popover_Content) => {
																									Popover_Content($$anchor, {
																										align: 'start',
																										class: 'w-60 p-3',
																										children: ($$anchor, $$slotProps) => {
																											var div = root_4();

																											$.each(
																												div,
																												20,
																												() => [
																													"var(--foreground)",
																													"#fa423e",
																													"#f59e0b",
																													"#8b5cf6",
																													"#ec4899",
																													"#10b981",
																													"#6366f1",
																													"#14b8a6",
																													"#f97316",
																													"#fbbc04"
																												],
																												(color) => color,
																												($$anchor, color) => {
																													{
																														let $0 = $.derived(() => `--color: ${color}`);
																														let $1 = $.derived(() => $.get(selectedColor) === color);

																														Button($$anchor, {
																															size: 'icon',
																															variant: 'ghost',
																															class: 'rounded-full p-1',
																															get style() {
																																return $.get($0);
																															},

																															get 'data-checked'() {
																																return $.get($1);
																															},

																															onclick: () => {
																																$.set(selectedColor, color, true);
																															},

																															children: ($$anchor, $$slotProps) => {
																																var fragment_27 = root_3();
																																var span = $.sibling($.first_child(fragment_27), 2);
																																var text_8 = $.only_child(span, true);

																																$.template_effect(() => $.set_text(text_8, color));
																																$.append($$anchor, fragment_27);
																															},
																															$$slots: { default: true }
																														});
																													}
																												}
																											);

																											$.reset(div);
																											$.append($$anchor, div);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_23);
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

															var node_35 = $.sibling(node_28, 2);

															$.component(node_35, () => Field.Description, ($$anchor, Field_Description) => {
																Field_Description($$anchor, {
																	class: 'flex flex-wrap gap-2',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_28 = $.comment();
																		var node_36 = $.first_child(fragment_28);

																		$.each(node_36, 17, () => categories, (category) => category.id, ($$anchor, category) => {
																			var button = root_5();
																			var node_37 = $.child(button);

																			IconPlaceholder(node_37, {
																				lucide: 'CircleCheckIcon',
																				tabler: 'IconCircleCheck',
																				hugeicons: 'CheckmarkCircle02Icon',
																				phosphor: 'CheckCircleIcon',
																				remixicon: 'RiCheckboxCircleLine',
																				'data-icon': 'inline-start',
																				class: 'hidden group-data-[checked=true]/badge:inline'
																			});

																			var text_9 = $.sibling(node_37);

																			$.reset(button);

																			$.template_effect(
																				($0) => {
																					$.set_attribute(button, 'data-checked', $.get(selectedCategory) === $.get(category).id);
																					$.set_class(button, 1, $0);
																					$.set_text(text_9, ` ${$.get(category).label ?? ''}`);
																				},
																				[
																					() => $.clsx(cn(
																						badgeVariants({
																							variant: $.get(selectedCategory) === $.get(category).id ? "default" : "outline"
																						}),
																						"group/badge cursor-pointer"
																					))
																				]
																			);

																			$.delegated('click', button, () => {
																				$.set(selectedCategory, $.get(selectedCategory) === $.get(category).id ? null : $.get(category).id, true);
																			});

																			$.append($$anchor, button);
																		});

																		$.append($$anchor, fragment_28);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_20);
														},
														$$slots: { default: true }
													});
												});

												var node_38 = $.sibling(node_26, 2);

												$.component(node_38, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															Alert($$anchor, {
																class: 'bg-muted',
																children: ($$anchor, $$slotProps) => {
																	var fragment_30 = root_1();
																	var node_39 = $.first_child(fragment_30);

																	IconPlaceholder(node_39, {
																		lucide: 'LightbulbIcon',
																		tabler: 'IconBulb',
																		hugeicons: 'BulbIcon',
																		phosphor: 'LightbulbIcon',
																		remixicon: 'RiLightbulbLine'
																	});

																	var node_40 = $.sibling(node_39, 2);

																	AlertDescription(node_40, {
																		class: 'text-xs',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text('Projects keep chats, files, and custom instructions in one place. Use them for ongoing\n							work, or just to keep things tidy.');

																			$.append($$anchor, text_10);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_30);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												});

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

$.delegate(['click']);