import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Kbd } from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`Add File <!>`, 1);
var root_2 = $.from_html(`<!> Create new file`, 1);
var root_3 = $.from_html(`<!> Upload files`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`Start Task <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!></div>`);

export default function Repository_toolbar($$anchor) {
	let selectedBranch = $.state("main");

	const branches = [
		"main",
		"develop",
		"feature/123",
		"feature/user-authentication",
		"feature/dashboard-redesign",
		"bugfix/login-error",
		"hotfix/security-patch",
		"release/v2.0.0",
		"feature/api-integration",
		"bugfix/memory-leak",
		"feature/dark-mode",
		"feature/responsive-design",
		"bugfix/typo-fix",
		"feature/search-functionality",
		"release/v1.9.0",
		"feature/notifications",
		"bugfix/cache-issue",
		"feature/payment-gateway",
		"hotfix/critical-bug",
		"feature/admin-panel",
		"bugfix/validation-error",
		"feature/analytics",
		"release/v2.1.0"
	];

	Example($$anchor, {
		title: 'Repository Toolbar',
		children: ($$anchor, $$slotProps) => {
			var div = root_6();
			var node = $.child(div);

			$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
				InputGroup_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
							InputGroup_Input($$anchor, { placeholder: 'Go to file' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
							InputGroup_Addon($$anchor, {
								align: 'inline-start',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
										InputGroup_Button($$anchor, {
											variant: 'ghost',
											size: 'icon-xs',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'SearchIcon',
													tabler: 'IconSearch',
													hugeicons: 'SearchIcon',
													phosphor: 'MagnifyingGlassIcon',
													remixicon: 'RiSearchLine'
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
							InputGroup_Addon_1($$anchor, {
								align: 'inline-end',
								children: ($$anchor, $$slotProps) => {
									Kbd($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('t');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			$.component(node_5, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_4();
						var node_6 = $.first_child(fragment_5);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_7 = root_1();
										var node_7 = $.sibling($.first_child(fragment_7));

										IconPlaceholder(node_7, {
											lucide: 'ChevronDownIcon',
											tabler: 'IconChevronDown',
											hugeicons: 'ArrowDown01Icon',
											phosphor: 'CaretDownIcon',
											remixicon: 'RiArrowDownSLine',
											'data-icon': 'inline-end'
										});

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
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_9 = $.first_child(fragment_8);

									$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
										DropdownMenu_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_2();
												var node_10 = $.first_child(fragment_9);

												IconPlaceholder(node_10, {
													lucide: 'PlusIcon',
													tabler: 'IconPlus',
													hugeicons: 'PlusSignIcon',
													phosphor: 'PlusIcon',
													remixicon: 'RiAddLine'
												});

												$.next();
												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_9, 2);

									$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
										DropdownMenu_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_3();
												var node_12 = $.first_child(fragment_10);

												IconPlaceholder(node_12, {
													lucide: 'UploadIcon',
													hugeicons: 'Upload01Icon',
													tabler: 'IconUpload',
													phosphor: 'UploadIcon',
													remixicon: 'RiUploadLine'
												});

												$.next();
												$.append($$anchor, fragment_10);
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

			var node_13 = $.sibling(node_5, 2);

			$.component(node_13, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_4();
						var node_14 = $.first_child(fragment_11);

						$.component(node_14, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
							Tooltip_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_4();
									var node_15 = $.first_child(fragment_12);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											var fragment_13 = $.comment();
											var node_16 = $.first_child(fragment_13);

											{
												const child = ($$anchor, $$arg0) => {
													let triggerProps = () => ($$arg0?.()).props;

													Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, triggerProps, {
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'CloudCogIcon',
																hugeicons: 'AiCloud01Icon',
																tabler: 'IconCloudCog',
																phosphor: 'CloudArrowUpIcon',
																remixicon: 'RiCloudLine'
															});
														},
														$$slots: { default: true }
													}));
												};

												$.component(node_16, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
													Popover_Trigger($$anchor, $.spread_props(props, { child, $$slots: { child: true } }));
												});
											}

											$.append($$anchor, fragment_13);
										};

										$.component(node_15, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
											Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
										});
									}

									var node_17 = $.sibling(node_15, 2);

									$.component(node_17, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('New Agent Task');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_14, 2);

						$.component(node_18, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-80',
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = $.comment();
									var node_19 = $.first_child(fragment_16);

									$.component(node_19, () => Field.Field, ($$anchor, Field_Field) => {
										Field_Field($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_17 = root_4();
												var node_20 = $.first_child(fragment_17);

												$.component(node_20, () => Field.Label, ($$anchor, Field_Label) => {
													Field_Label($$anchor, {
														for: 'new-agent-task',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('New Agent Task');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
													InputGroup_Root_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root_4();
															var node_22 = $.first_child(fragment_18);

															$.component(node_22, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
																InputGroup_Textarea($$anchor, { placeholder: 'Describe your task in natural language.' });
															});

															var node_23 = $.sibling(node_22, 2);

															$.component(node_23, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																InputGroup_Addon_2($$anchor, {
																	align: 'block-end',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = root();
																		var node_24 = $.first_child(fragment_19);

																		$.component(node_24, () => Popover.Root, ($$anchor, Popover_Root_1) => {
																			Popover_Root_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_20 = root_4();
																					var node_25 = $.first_child(fragment_20);

																					$.component(node_25, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																						Tooltip_Root_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_21 = root_4();
																								var node_26 = $.first_child(fragment_21);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var fragment_22 = $.comment();
																										var node_27 = $.first_child(fragment_22);

																										{
																											const child = ($$anchor, $$arg0) => {
																												let triggerProps = () => ($$arg0?.()).props;
																												var fragment_23 = $.comment();
																												var node_28 = $.first_child(fragment_23);

																												$.component(node_28, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																													InputGroup_Button_1($$anchor, $.spread_props({ variant: 'outline', size: 'icon-sm' }, triggerProps, {
																														children: ($$anchor, $$slotProps) => {
																															IconPlaceholder($$anchor, {
																																lucide: 'GitBranchIcon',
																																hugeicons: 'GitBranchIcon',
																																tabler: 'IconGitBranch',
																																phosphor: 'GitBranchIcon',
																																remixicon: 'RiGitBranchLine'
																															});
																														},
																														$$slots: { default: true }
																													}));
																												});

																												$.append($$anchor, fragment_23);
																											};

																											$.component(node_27, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																												Tooltip_Trigger_1($$anchor, $.spread_props(props, { child, $$slots: { child: true } }));
																											});
																										}

																										$.append($$anchor, fragment_22);
																									};

																									$.component(node_26, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
																										Popover_Trigger_1($$anchor, { child, $$slots: { child: true } });
																									});
																								}

																								var node_29 = $.sibling(node_26, 2);

																								$.component(node_29, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																									Tooltip_Content_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text('Select a branch');

																											$.append($$anchor, text_3);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_21);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_30 = $.sibling(node_25, 2);

																					$.component(node_30, () => Popover.Content, ($$anchor, Popover_Content_1) => {
																						Popover_Content_1($$anchor, {
																							side: 'bottom',
																							align: 'start',
																							class: 'p-1',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_25 = $.comment();
																								var node_31 = $.first_child(fragment_25);

																								$.component(node_31, () => Field.Field, ($$anchor, Field_Field_1) => {
																									Field_Field_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_26 = root_4();
																											var node_32 = $.first_child(fragment_26);

																											$.component(node_32, () => Field.Label, ($$anchor, Field_Label_1) => {
																												Field_Label_1($$anchor, {
																													for: 'select-branch',
																													class: 'sr-only',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_4 = $.text('Select a Branch');

																														$.append($$anchor, text_4);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_33 = $.sibling(node_32, 2);

																											$.component(node_33, () => Command.Root, ($$anchor, Command_Root) => {
																												Command_Root($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_27 = root();
																														var node_34 = $.first_child(fragment_27);

																														$.component(node_34, () => Command.Input, ($$anchor, Command_Input) => {
																															Command_Input($$anchor, { id: 'select-branch', placeholder: 'Find a branch' });
																														});

																														var node_35 = $.sibling(node_34, 2);

																														$.component(node_35, () => Command.Empty, ($$anchor, Command_Empty) => {
																															Command_Empty($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_5 = $.text('No branches found');

																																	$.append($$anchor, text_5);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_36 = $.sibling(node_35, 2);

																														$.component(node_36, () => Command.List, ($$anchor, Command_List) => {
																															Command_List($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_28 = $.comment();
																																	var node_37 = $.first_child(fragment_28);

																																	$.component(node_37, () => Command.Group, ($$anchor, Command_Group) => {
																																		Command_Group($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_29 = $.comment();
																																				var node_38 = $.first_child(fragment_29);

																																				$.each(node_38, 16, () => branches, (branch) => branch, ($$anchor, branch) => {
																																					var fragment_30 = $.comment();
																																					var node_39 = $.first_child(fragment_30);

																																					{
																																						let $0 = $.derived(() => $.get(selectedBranch) === branch);

																																						$.component(node_39, () => Command.Item, ($$anchor, Command_Item) => {
																																							Command_Item($$anchor, {
																																								get value() {
																																									return branch;
																																								},
																																								onSelect: () => $.set(selectedBranch, branch, true),
																																								get 'data-checked'() {
																																									return $.get($0);
																																								},

																																								children: ($$anchor, $$slotProps) => {
																																									$.next();

																																									var text_6 = $.text();

																																									$.template_effect(() => $.set_text(text_6, branch));
																																									$.append($$anchor, text_6);
																																								},
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

																								$.append($$anchor, fragment_25);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_20);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_40 = $.sibling(node_24, 2);

																		$.component(node_40, () => Popover.Root, ($$anchor, Popover_Root_2) => {
																			Popover_Root_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_32 = root_4();
																					var node_41 = $.first_child(fragment_32);

																					$.component(node_41, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
																						Tooltip_Root_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_33 = root_4();
																								var node_42 = $.first_child(fragment_33);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;
																										var fragment_34 = $.comment();
																										var node_43 = $.first_child(fragment_34);

																										{
																											const child = ($$anchor, $$arg0) => {
																												let triggerProps = () => ($$arg0?.()).props;
																												var fragment_35 = $.comment();
																												var node_44 = $.first_child(fragment_35);

																												$.component(node_44, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
																													InputGroup_Button_2($$anchor, $.spread_props({ variant: 'outline', size: 'icon-sm' }, triggerProps, {
																														children: ($$anchor, $$slotProps) => {
																															IconPlaceholder($$anchor, {
																																lucide: 'BotIcon',
																																hugeicons: 'RoboticIcon',
																																tabler: 'IconRobot',
																																phosphor: 'RobotIcon',
																																remixicon: 'RiRobotLine'
																															});
																														},
																														$$slots: { default: true }
																													}));
																												});

																												$.append($$anchor, fragment_35);
																											};

																											$.component(node_43, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
																												Tooltip_Trigger_2($$anchor, $.spread_props(props, { child, $$slots: { child: true } }));
																											});
																										}

																										$.append($$anchor, fragment_34);
																									};

																									$.component(node_42, () => Popover.Trigger, ($$anchor, Popover_Trigger_2) => {
																										Popover_Trigger_2($$anchor, { child, $$slots: { child: true } });
																									});
																								}

																								var node_45 = $.sibling(node_42, 2);

																								$.component(node_45, () => Tooltip.Content, ($$anchor, Tooltip_Content_2) => {
																									Tooltip_Content_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_7 = $.text('Select Agent');

																											$.append($$anchor, text_7);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_33);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_46 = $.sibling(node_41, 2);

																					$.component(node_46, () => Popover.Content, ($$anchor, Popover_Content_2) => {
																						Popover_Content_2($$anchor, {
																							side: 'top',
																							align: 'start',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_37 = $.comment();
																								var node_47 = $.first_child(fragment_37);

																								$.component(node_47, () => Empty.Root, ($$anchor, Empty_Root) => {
																									Empty_Root($$anchor, {
																										class: 'gap-4 p-0',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_38 = root_4();
																											var node_48 = $.first_child(fragment_38);

																											$.component(node_48, () => Empty.Header, ($$anchor, Empty_Header) => {
																												Empty_Header($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_39 = root_4();
																														var node_49 = $.first_child(fragment_39);

																														$.component(node_49, () => Empty.Title, ($$anchor, Empty_Title) => {
																															Empty_Title($$anchor, {
																																class: 'text-sm',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_8 = $.text('This repository has no custom agents');

																																	$.append($$anchor, text_8);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_50 = $.sibling(node_49, 2);

																														$.component(node_50, () => Empty.Description, ($$anchor, Empty_Description) => {
																															Empty_Description($$anchor, {
																																class: 'text-xs',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_9 = $.text('Custom agents are reusable instructions and tools in your repository.');

																																	$.append($$anchor, text_9);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_39);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_51 = $.sibling(node_48, 2);

																											$.component(node_51, () => Empty.Content, ($$anchor, Empty_Content) => {
																												Empty_Content($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														Button($$anchor, {
																															variant: 'outline',
																															size: 'sm',
																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_10 = $.text('Create Custom Agent');

																																$.append($$anchor, text_10);
																															},
																															$$slots: { default: true }
																														});
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_38);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_37);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_32);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_52 = $.sibling(node_40, 2);

																		$.component(node_52, () => Tooltip.Root, ($$anchor, Tooltip_Root_3) => {
																			Tooltip_Root_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_41 = root_4();
																					var node_53 = $.first_child(fragment_41);

																					{
																						const child = ($$anchor, $$arg0) => {
																							let props = () => ($$arg0?.()).props;
																							var fragment_42 = $.comment();
																							var node_54 = $.first_child(fragment_42);

																							$.component(node_54, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
																								InputGroup_Button_3($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm', class: 'ml-auto' }, props, {
																									children: ($$anchor, $$slotProps) => {
																										IconPlaceholder($$anchor, {
																											lucide: 'SendIcon',
																											hugeicons: 'SentIcon',
																											tabler: 'IconSend',
																											phosphor: 'PaperPlaneTiltIcon',
																											remixicon: 'RiSendPlaneLine'
																										});
																									},
																									$$slots: { default: true }
																								}));
																							});

																							$.append($$anchor, fragment_42);
																						};

																						$.component(node_53, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_3) => {
																							Tooltip_Trigger_3($$anchor, { child, $$slots: { child: true } });
																						});
																					}

																					var node_55 = $.sibling(node_53, 2);

																					$.component(node_55, () => Tooltip.Content, ($$anchor, Tooltip_Content_3) => {
																						Tooltip_Content_3($$anchor, {
																							class: 'flex items-center gap-2 pr-2',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var fragment_44 = root_5();
																								var node_56 = $.sibling($.first_child(fragment_44));

																								Kbd(node_56, {
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_11 = $.text('⏎');

																										$.append($$anchor, text_11);
																									},
																									$$slots: { default: true }
																								});

																								$.append($$anchor, fragment_44);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_41);
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

												$.append($$anchor, fragment_17);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}