import * as $ from 'svelte/internal/server';
import * as Command from "$lib/registry/ui/command/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Command_many_items($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Many Groups & Items',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col gap-4">`);

				Button($$renderer, {
					onclick: () => open = true,
					variant: 'outline',
					class: 'w-fit',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Menu`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (Command.Dialog) {
					$$renderer.push('<!--[-->');

					Command.Dialog($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Command.Input) {
								$$renderer.push('<!--[-->');
								Command.Input($$renderer, { placeholder: 'Type a command or search...' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Command.List) {
								$$renderer.push('<!--[-->');

								Command.List($$renderer, {
									children: ($$renderer) => {
										if (Command.Empty) {
											$$renderer.push('<!--[-->');

											Command.Empty($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->No results found.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Group) {
											$$renderer.push('<!--[-->');

											Command.Group($$renderer, {
												heading: 'Navigation',
												children: ($$renderer) => {
													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'HomeIcon',
																	tabler: 'IconHome',
																	hugeicons: 'HomeIcon',
																	phosphor: 'HouseIcon',
																	remixicon: 'RiHomeLine'
																});

																$$renderer.push(`<!----> <span>Home</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘H`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'InboxIcon',
																	tabler: 'IconInbox',
																	hugeicons: 'InboxIcon',
																	phosphor: 'TrayIcon',
																	remixicon: 'RiInboxLine'
																});

																$$renderer.push(`<!----> <span>Inbox</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘I`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'FileTextIcon',
																	tabler: 'IconFileText',
																	hugeicons: 'File02Icon',
																	phosphor: 'FileTextIcon',
																	remixicon: 'RiFileTextLine'
																});

																$$renderer.push(`<!----> <span>Documents</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘D`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'FolderIcon',
																	tabler: 'IconFolder',
																	hugeicons: 'FolderIcon',
																	phosphor: 'FolderIcon',
																	remixicon: 'RiFolderLine'
																});

																$$renderer.push(`<!----> <span>Folders</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘F`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Separator) {
											$$renderer.push('<!--[-->');
											Command.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Group) {
											$$renderer.push('<!--[-->');

											Command.Group($$renderer, {
												heading: 'Actions',
												children: ($$renderer) => {
													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'PlusIcon',
																	tabler: 'IconPlus',
																	hugeicons: 'PlusSignIcon',
																	phosphor: 'PlusIcon',
																	remixicon: 'RiAddLine'
																});

																$$renderer.push(`<!----> <span>New File</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘N`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'FolderPlusIcon',
																	tabler: 'IconFolderPlus',
																	hugeicons: 'FolderAddIcon',
																	phosphor: 'FolderPlusIcon',
																	remixicon: 'RiFolderAddLine'
																});

																$$renderer.push(`<!----> <span>New Folder</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⇧⌘N`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CopyIcon',
																	tabler: 'IconCopy',
																	hugeicons: 'CopyIcon',
																	phosphor: 'CopyIcon',
																	remixicon: 'RiFileCopyLine'
																});

																$$renderer.push(`<!----> <span>Copy</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘C`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'ScissorsIcon',
																	tabler: 'IconCut',
																	hugeicons: 'ScissorIcon',
																	phosphor: 'ScissorsIcon',
																	remixicon: 'RiScissorsLine'
																});

																$$renderer.push(`<!----> <span>Cut</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘X`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'ClipboardPasteIcon',
																	tabler: 'IconClipboard',
																	hugeicons: 'ClipboardIcon',
																	phosphor: 'ClipboardIcon',
																	remixicon: 'RiClipboardLine'
																});

																$$renderer.push(`<!----> <span>Paste</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘V`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'TrashIcon',
																	tabler: 'IconTrash',
																	hugeicons: 'DeleteIcon',
																	phosphor: 'TrashIcon',
																	remixicon: 'RiDeleteBinLine'
																});

																$$renderer.push(`<!----> <span>Delete</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌫`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Separator) {
											$$renderer.push('<!--[-->');
											Command.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Group) {
											$$renderer.push('<!--[-->');

											Command.Group($$renderer, {
												heading: 'View',
												children: ($$renderer) => {
													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'LayoutGridIcon',
																	tabler: 'IconLayoutGrid',
																	hugeicons: 'GridIcon',
																	phosphor: 'GridFourIcon',
																	remixicon: 'RiGridLine'
																});

																$$renderer.push(`<!----> <span>Grid View</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'ListIcon',
																	tabler: 'IconList',
																	hugeicons: 'Menu05Icon',
																	phosphor: 'ListIcon',
																	remixicon: 'RiListUnordered'
																});

																$$renderer.push(`<!----> <span>List View</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'ZoomInIcon',
																	tabler: 'IconZoomIn',
																	hugeicons: 'ZoomInAreaIcon',
																	phosphor: 'MagnifyingGlassPlusIcon',
																	remixicon: 'RiZoomInLine'
																});

																$$renderer.push(`<!----> <span>Zoom In</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘+`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'ZoomOutIcon',
																	tabler: 'IconZoomOut',
																	hugeicons: 'ZoomOutAreaIcon',
																	phosphor: 'MagnifyingGlassMinusIcon',
																	remixicon: 'RiSearchEyeLine'
																});

																$$renderer.push(`<!----> <span>Zoom Out</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘-`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Separator) {
											$$renderer.push('<!--[-->');
											Command.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Group) {
											$$renderer.push('<!--[-->');

											Command.Group($$renderer, {
												heading: 'Account',
												children: ($$renderer) => {
													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'UserIcon',
																	tabler: 'IconUser',
																	hugeicons: 'UserIcon',
																	phosphor: 'UserIcon',
																	remixicon: 'RiUserLine'
																});

																$$renderer.push(`<!----> <span>Profile</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘P`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CreditCardIcon',
																	tabler: 'IconCreditCard',
																	hugeicons: 'CreditCardIcon',
																	phosphor: 'CreditCardIcon',
																	remixicon: 'RiBankCardLine'
																});

																$$renderer.push(`<!----> <span>Billing</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘B`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'SettingsIcon',
																	tabler: 'IconSettings',
																	hugeicons: 'SettingsIcon',
																	phosphor: 'GearIcon',
																	remixicon: 'RiSettingsLine'
																});

																$$renderer.push(`<!----> <span>Settings</span> `);

																if (Command.Shortcut) {
																	$$renderer.push('<!--[-->');

																	Command.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘S`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'BellIcon',
																	tabler: 'IconBell',
																	hugeicons: 'NotificationIcon',
																	phosphor: 'BellIcon',
																	remixicon: 'RiNotificationLine'
																});

																$$renderer.push(`<!----> <span>Notifications</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'HelpCircleIcon',
																	tabler: 'IconHelpCircle',
																	hugeicons: 'HelpCircleIcon',
																	phosphor: 'QuestionIcon',
																	remixicon: 'RiQuestionLine'
																});

																$$renderer.push(`<!----> <span>Help &amp; Support</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Separator) {
											$$renderer.push('<!--[-->');
											Command.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Group) {
											$$renderer.push('<!--[-->');

											Command.Group($$renderer, {
												heading: 'Tools',
												children: ($$renderer) => {
													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CalculatorIcon',
																	tabler: 'IconCalculator',
																	hugeicons: 'CalculatorIcon',
																	phosphor: 'CalculatorIcon',
																	remixicon: 'RiCalculatorLine'
																});

																$$renderer.push(`<!----> <span>Calculator</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CalendarIcon',
																	tabler: 'IconCalendar',
																	hugeicons: 'CalendarIcon',
																	phosphor: 'CalendarBlankIcon',
																	remixicon: 'RiCalendarLine'
																});

																$$renderer.push(`<!----> <span>Calendar</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'ImageIcon',
																	tabler: 'IconPhoto',
																	hugeicons: 'ImageIcon',
																	phosphor: 'ImageIcon',
																	remixicon: 'RiImageLine'
																});

																$$renderer.push(`<!----> <span>Image Editor</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CodeIcon',
																	tabler: 'IconCode',
																	hugeicons: 'CodeIcon',
																	phosphor: 'CodeIcon',
																	remixicon: 'RiCodeLine'
																});

																$$renderer.push(`<!----> <span>Code Editor</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}