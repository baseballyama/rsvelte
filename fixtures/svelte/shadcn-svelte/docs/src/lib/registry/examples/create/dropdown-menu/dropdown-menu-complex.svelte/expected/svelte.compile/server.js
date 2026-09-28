import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_complex($$renderer) {
	let notifications = { email: true, sms: false, push: true };
	let theme = "light";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Complex',
			children: ($$renderer) => {
				if (DropdownMenu.Root) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ variant: 'outline', class: 'w-fit' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->Complex Menu`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (DropdownMenu.Trigger) {
									$$renderer.push('<!--[-->');
									DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (DropdownMenu.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Content($$renderer, {
									class: 'style-vega:w-56 style-nova:w-48 style-lyra:w-48 style-maia:w-56 style-mira:w-48',
									children: ($$renderer) => {
										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Label) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->File`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'FileIcon',
																	tabler: 'IconFile',
																	hugeicons: 'FileIcon',
																	phosphor: 'FileIcon',
																	remixicon: 'RiFileLine'
																});

																$$renderer.push(`<!----> New File `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
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

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'FolderIcon',
																	tabler: 'IconFolder',
																	hugeicons: 'FolderIcon',
																	phosphor: 'FolderIcon',
																	remixicon: 'RiFolderLine'
																});

																$$renderer.push(`<!----> New Folder `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
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

													if (DropdownMenu.Sub) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Sub($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.SubTrigger) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.SubTrigger($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'FolderOpenIcon',
																				tabler: 'IconFolderOpen',
																				hugeicons: 'FolderOpenIcon',
																				phosphor: 'FolderOpenIcon',
																				remixicon: 'RiFolderOpenLine'
																			});

																			$$renderer.push(`<!----> Open Recent`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Portal) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Portal($$renderer, {
																		children: ($$renderer) => {
																			if (DropdownMenu.SubContent) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.SubContent($$renderer, {
																					children: ($$renderer) => {
																						if (DropdownMenu.Group) {
																							$$renderer.push('<!--[-->');

																							DropdownMenu.Group($$renderer, {
																								children: ($$renderer) => {
																									if (DropdownMenu.Label) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Label($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Recent Projects`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'FileCodeIcon',
																													tabler: 'IconFileCode',
																													hugeicons: 'CodeIcon',
																													phosphor: 'CodeIcon',
																													remixicon: 'RiFileCodeLine'
																												});

																												$$renderer.push(`<!----> Project Alpha`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'FileCodeIcon',
																													tabler: 'IconFileCode',
																													hugeicons: 'CodeIcon',
																													phosphor: 'CodeIcon',
																													remixicon: 'RiFileCodeLine'
																												});

																												$$renderer.push(`<!----> Project Beta`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Sub) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Sub($$renderer, {
																											children: ($$renderer) => {
																												if (DropdownMenu.SubTrigger) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.SubTrigger($$renderer, {
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'MoreHorizontalIcon',
																																tabler: 'IconDots',
																																hugeicons: 'MoreHorizontalCircle01Icon',
																																phosphor: 'DotsThreeOutlineIcon',
																																remixicon: 'RiMoreLine'
																															});

																															$$renderer.push(`<!----> More Projects`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}

																												$$renderer.push(` `);

																												if (DropdownMenu.Portal) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.Portal($$renderer, {
																														children: ($$renderer) => {
																															if (DropdownMenu.SubContent) {
																																$$renderer.push('<!--[-->');

																																DropdownMenu.SubContent($$renderer, {
																																	children: ($$renderer) => {
																																		if (DropdownMenu.Item) {
																																			$$renderer.push('<!--[-->');

																																			DropdownMenu.Item($$renderer, {
																																				children: ($$renderer) => {
																																					IconPlaceholder($$renderer, {
																																						lucide: 'FileCodeIcon',
																																						tabler: 'IconFileCode',
																																						hugeicons: 'CodeIcon',
																																						phosphor: 'FileCodeIcon',
																																						remixicon: 'RiFileCodeLine'
																																					});

																																					$$renderer.push(`<!----> Project Gamma`);
																																				},
																																				$$slots: { default: true }
																																			});

																																			$$renderer.push('<!--]-->');
																																		} else {
																																			$$renderer.push('<!--[!-->');
																																			$$renderer.push('<!--]-->');
																																		}

																																		$$renderer.push(` `);

																																		if (DropdownMenu.Item) {
																																			$$renderer.push('<!--[-->');

																																			DropdownMenu.Item($$renderer, {
																																				children: ($$renderer) => {
																																					IconPlaceholder($$renderer, {
																																						lucide: 'FileCodeIcon',
																																						tabler: 'IconFileCode',
																																						hugeicons: 'CodeIcon',
																																						phosphor: 'FileCodeIcon',
																																						remixicon: 'RiFileCodeLine'
																																					});

																																					$$renderer.push(`<!----> Project Delta`);
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
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (DropdownMenu.Separator) {
																							$$renderer.push('<!--[-->');
																							DropdownMenu.Separator($$renderer, {});
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (DropdownMenu.Group) {
																							$$renderer.push('<!--[-->');

																							DropdownMenu.Group($$renderer, {
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'FolderSearchIcon',
																													tabler: 'IconFolderSearch',
																													hugeicons: 'SearchIcon',
																													phosphor: 'MagnifyingGlassIcon',
																													remixicon: 'RiSearchLine'
																												});

																												$$renderer.push(`<!----> Browse...`);
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
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Separator) {
														$$renderer.push('<!--[-->');
														DropdownMenu.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'SaveIcon',
																	tabler: 'IconDeviceFloppy',
																	hugeicons: 'FloppyDiskIcon',
																	phosphor: 'FloppyDiskIcon',
																	remixicon: 'RiSaveLine'
																});

																$$renderer.push(`<!----> Save `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
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

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'DownloadIcon',
																	tabler: 'IconDownload',
																	hugeicons: 'DownloadIcon',
																	phosphor: 'DownloadIcon',
																	remixicon: 'RiDownloadLine'
																});

																$$renderer.push(`<!----> Export `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⇧⌘E`);
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

										if (DropdownMenu.Separator) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Label) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->View`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.CheckboxItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.CheckboxItem($$renderer, {
															checked: notifications.email,
															onCheckedChange: (checked) => notifications = { ...notifications, email: checked === true },
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'EyeIcon',
																	tabler: 'IconEye',
																	hugeicons: 'EyeIcon',
																	phosphor: 'EyeIcon',
																	remixicon: 'RiEyeLine'
																});

																$$renderer.push(`<!----> Show Sidebar`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.CheckboxItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.CheckboxItem($$renderer, {
															checked: notifications.sms,
															onCheckedChange: (checked) => notifications = { ...notifications, sms: checked === true },
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'LayoutIcon',
																	tabler: 'IconLayout',
																	hugeicons: 'LayoutIcon',
																	phosphor: 'LayoutIcon',
																	remixicon: 'RiLayoutLine'
																});

																$$renderer.push(`<!----> Show Status Bar`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Sub) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Sub($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.SubTrigger) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.SubTrigger($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'PaletteIcon',
																				tabler: 'IconPalette',
																				hugeicons: 'PaintBoardIcon',
																				phosphor: 'PaletteIcon',
																				remixicon: 'RiPaletteLine'
																			});

																			$$renderer.push(`<!----> Theme`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Portal) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Portal($$renderer, {
																		children: ($$renderer) => {
																			if (DropdownMenu.SubContent) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.SubContent($$renderer, {
																					children: ($$renderer) => {
																						if (DropdownMenu.Group) {
																							$$renderer.push('<!--[-->');

																							DropdownMenu.Group($$renderer, {
																								children: ($$renderer) => {
																									if (DropdownMenu.Label) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Label($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Appearance`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.RadioGroup) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.RadioGroup($$renderer, {
																											get value() {
																												return theme;
																											},

																											set value($$value) {
																												theme = $$value;
																												$$settled = false;
																											},

																											children: ($$renderer) => {
																												if (DropdownMenu.RadioItem) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.RadioItem($$renderer, {
																														value: 'light',
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'SunIcon',
																																tabler: 'IconSun',
																																hugeicons: 'SunIcon',
																																phosphor: 'SunIcon',
																																remixicon: 'RiSunLine'
																															});

																															$$renderer.push(`<!----> Light`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}

																												$$renderer.push(` `);

																												if (DropdownMenu.RadioItem) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.RadioItem($$renderer, {
																														value: 'dark',
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'MoonIcon',
																																tabler: 'IconMoon',
																																hugeicons: 'MoonIcon',
																																phosphor: 'MoonIcon',
																																remixicon: 'RiMoonLine'
																															});

																															$$renderer.push(`<!----> Dark`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}

																												$$renderer.push(` `);

																												if (DropdownMenu.RadioItem) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.RadioItem($$renderer, {
																														value: 'system',
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'MonitorIcon',
																																tabler: 'IconDeviceDesktop',
																																hugeicons: 'ComputerIcon',
																																phosphor: 'MonitorIcon',
																																remixicon: 'RiComputerLine'
																															});

																															$$renderer.push(`<!----> System`);
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

										if (DropdownMenu.Separator) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Label) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Account`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'UserIcon',
																	tabler: 'IconUser',
																	hugeicons: 'UserIcon',
																	phosphor: 'UserIcon',
																	remixicon: 'RiUserLine'
																});

																$$renderer.push(`<!----> Profile `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⇧⌘P`);
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

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'CreditCardIcon',
																	tabler: 'IconCreditCard',
																	hugeicons: 'CreditCardIcon',
																	phosphor: 'CreditCardIcon',
																	remixicon: 'RiBankCardLine'
																});

																$$renderer.push(`<!----> Billing`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Sub) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Sub($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.SubTrigger) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.SubTrigger($$renderer, {
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'SettingsIcon',
																				tabler: 'IconSettings',
																				hugeicons: 'SettingsIcon',
																				phosphor: 'GearIcon',
																				remixicon: 'RiSettingsLine'
																			});

																			$$renderer.push(`<!----> Settings`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Portal) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Portal($$renderer, {
																		children: ($$renderer) => {
																			if (DropdownMenu.SubContent) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.SubContent($$renderer, {
																					children: ($$renderer) => {
																						if (DropdownMenu.Group) {
																							$$renderer.push('<!--[-->');

																							DropdownMenu.Group($$renderer, {
																								children: ($$renderer) => {
																									if (DropdownMenu.Label) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Label($$renderer, {
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Preferences`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'KeyboardIcon',
																													tabler: 'IconKeyboard',
																													hugeicons: 'KeyboardIcon',
																													phosphor: 'KeyboardIcon',
																													remixicon: 'RiKeyboardLine'
																												});

																												$$renderer.push(`<!----> Keyboard Shortcuts`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'LanguagesIcon',
																													tabler: 'IconLanguage',
																													hugeicons: 'LanguageCircleIcon',
																													phosphor: 'TranslateIcon',
																													remixicon: 'RiTranslate'
																												});

																												$$renderer.push(`<!----> Language`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (DropdownMenu.Sub) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Sub($$renderer, {
																											children: ($$renderer) => {
																												if (DropdownMenu.SubTrigger) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.SubTrigger($$renderer, {
																														children: ($$renderer) => {
																															IconPlaceholder($$renderer, {
																																lucide: 'BellIcon',
																																tabler: 'IconBell',
																																hugeicons: 'NotificationIcon',
																																phosphor: 'BellIcon',
																																remixicon: 'RiNotificationLine'
																															});

																															$$renderer.push(`<!----> Notifications`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}

																												$$renderer.push(` `);

																												if (DropdownMenu.Portal) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.Portal($$renderer, {
																														children: ($$renderer) => {
																															if (DropdownMenu.SubContent) {
																																$$renderer.push('<!--[-->');

																																DropdownMenu.SubContent($$renderer, {
																																	children: ($$renderer) => {
																																		if (DropdownMenu.Group) {
																																			$$renderer.push('<!--[-->');

																																			DropdownMenu.Group($$renderer, {
																																				children: ($$renderer) => {
																																					if (DropdownMenu.Label) {
																																						$$renderer.push('<!--[-->');

																																						DropdownMenu.Label($$renderer, {
																																							children: ($$renderer) => {
																																								$$renderer.push(`<!---->Notification Types`);
																																							},
																																							$$slots: { default: true }
																																						});

																																						$$renderer.push('<!--]-->');
																																					} else {
																																						$$renderer.push('<!--[!-->');
																																						$$renderer.push('<!--]-->');
																																					}

																																					$$renderer.push(` `);

																																					if (DropdownMenu.CheckboxItem) {
																																						$$renderer.push('<!--[-->');

																																						DropdownMenu.CheckboxItem($$renderer, {
																																							checked: notifications.push,
																																							onCheckedChange: (checked) => notifications = { ...notifications, push: checked === true },
																																							children: ($$renderer) => {
																																								IconPlaceholder($$renderer, {
																																									lucide: 'BellIcon',
																																									tabler: 'IconBell',
																																									hugeicons: 'NotificationIcon',
																																									phosphor: 'BellIcon',
																																									remixicon: 'RiNotificationLine'
																																								});

																																								$$renderer.push(`<!----> Push Notifications`);
																																							},
																																							$$slots: { default: true }
																																						});

																																						$$renderer.push('<!--]-->');
																																					} else {
																																						$$renderer.push('<!--[!-->');
																																						$$renderer.push('<!--]-->');
																																					}

																																					$$renderer.push(` `);

																																					if (DropdownMenu.CheckboxItem) {
																																						$$renderer.push('<!--[-->');

																																						DropdownMenu.CheckboxItem($$renderer, {
																																							checked: notifications.email,
																																							onCheckedChange: (checked) => notifications = { ...notifications, email: checked === true },
																																							children: ($$renderer) => {
																																								IconPlaceholder($$renderer, {
																																									lucide: 'MailIcon',
																																									tabler: 'IconMail',
																																									hugeicons: 'MailIcon',
																																									phosphor: 'EnvelopeIcon',
																																									remixicon: 'RiMailLine'
																																								});

																																								$$renderer.push(`<!----> Email Notifications`);
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

																						if (DropdownMenu.Separator) {
																							$$renderer.push('<!--[-->');
																							DropdownMenu.Separator($$renderer, {});
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (DropdownMenu.Group) {
																							$$renderer.push('<!--[-->');

																							DropdownMenu.Group($$renderer, {
																								children: ($$renderer) => {
																									if (DropdownMenu.Item) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.Item($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'ShieldIcon',
																													tabler: 'IconShield',
																													hugeicons: 'ShieldIcon',
																													phosphor: 'ShieldIcon',
																													remixicon: 'RiShieldLine'
																												});

																												$$renderer.push(`<!----> Privacy &amp; Security`);
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

										if (DropdownMenu.Separator) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'HelpCircleIcon',
																	tabler: 'IconHelpCircle',
																	hugeicons: 'HelpCircleIcon',
																	phosphor: 'QuestionIcon',
																	remixicon: 'RiQuestionLine'
																});

																$$renderer.push(`<!----> Help &amp; Support`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'FileTextIcon',
																	tabler: 'IconFileText',
																	hugeicons: 'File01Icon',
																	phosphor: 'FileTextIcon',
																	remixicon: 'RiFileTextLine'
																});

																$$renderer.push(`<!----> Documentation`);
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

										if (DropdownMenu.Separator) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															variant: 'destructive',
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'LogOutIcon',
																	tabler: 'IconLogout',
																	hugeicons: 'LogoutIcon',
																	phosphor: 'SignOutIcon',
																	remixicon: 'RiLogoutBoxLine'
																});

																$$renderer.push(`<!----> Sign Out `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⇧⌘Q`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}