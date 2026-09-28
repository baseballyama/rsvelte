import * as $ from 'svelte/internal/server';
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

export default function Small_form_example($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];

		const roleItems = [
			{ label: "Developer", value: "developer" },
			{ label: "Designer", value: "designer" },
			{ label: "Manager", value: "manager" },
			{ label: "Other", value: "other" }
		];

		let notifications = { email: true, sms: false, push: true };
		let theme = "light";
		let frameworkOpen = false;
		let frameworkValue = "";
		let role = undefined;
		let triggerRef = null;
		const selectedFramework = $.derived(() => frameworks.find((f) => f.toLowerCase() === frameworkValue) || "");

		function closeAndFocusTrigger() {
			frameworkOpen = false;

			tick().then(() => {
				triggerRef.focus();
			});
		}

		const roleLabel = $.derived(() => roleItems.find((item) => item.value === role)?.label ?? "Select role");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Form',
				children: ($$renderer) => {
					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							class: 'w-full max-w-md',
							children: ($$renderer) => {
								if (Card.Header) {
									$$renderer.push('<!--[-->');

									Card.Header($$renderer, {
										children: ($$renderer) => {
											if (Card.Title) {
												$$renderer.push('<!--[-->');

												Card.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->User Information`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Card.Description) {
												$$renderer.push('<!--[-->');

												Card.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Please fill in your details below`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Card.Action) {
												$$renderer.push('<!--[-->');

												Card.Action($$renderer, {
													children: ($$renderer) => {
														if (DropdownMenu.Root) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Root($$renderer, {
																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			Button($$renderer, $.spread_props([
																				{ variant: 'ghost', size: 'icon' },
																				props,
																				{
																					children: ($$renderer) => {
																						IconPlaceholder($$renderer, {
																							lucide: 'MoreVerticalIcon',
																							tabler: 'IconDotsVertical',
																							hugeicons: 'MoreVerticalCircle01Icon',
																							phosphor: 'DotsThreeVerticalIcon',
																							remixicon: 'RiMore2Line'
																						});

																						$$renderer.push(`<!----> <span class="sr-only">More options</span>`);
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
																			align: 'end',
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
																																																phosphor: 'CodeIcon',
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
																																																phosphor: 'CodeIcon',
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
																									onCheckedChange: (checked) => {
																										notifications = { ...notifications, email: checked === true };
																									},

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
																									onCheckedChange: (checked) => {
																										notifications = { ...notifications, sms: checked === true };
																									},

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
																																					value: theme,
																																					onValueChange: (value) => {
																																						setMode(value);
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

								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<form>`);

											if (Field.Group) {
												$$renderer.push('<!--[-->');

												Field.Group($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<div class="grid grid-cols-2 gap-4">`);

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: 'small-form-name',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Name`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	Input($$renderer, {
																		id: 'small-form-name',
																		placeholder: 'Enter your name',
																		required: true
																	});

																	$$renderer.push(`<!---->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: 'small-form-role',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Role`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Select.Root) {
																		$$renderer.push('<!--[-->');

																		Select.Root($$renderer, {
																			type: 'single',
																			get value() {
																				return role;
																			},

																			set value($$value) {
																				role = $$value;
																				$$settled = false;
																			},

																			children: ($$renderer) => {
																				if (Select.Trigger) {
																					$$renderer.push('<!--[-->');

																					Select.Trigger($$renderer, {
																						id: 'small-form-role',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(roleLabel())}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Select.Content) {
																					$$renderer.push('<!--[-->');

																					Select.Content($$renderer, {
																						children: ($$renderer) => {
																							if (Select.Group) {
																								$$renderer.push('<!--[-->');

																								Select.Group($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!--[-->`);

																										const each_array = $.ensure_array_like(roleItems);

																										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																											let item = each_array[$$index];

																											if (Select.Item) {
																												$$renderer.push('<!--[-->');

																												Select.Item($$renderer, {
																													value: item.value,
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->${$.escape(item.label)}`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										}

																										$$renderer.push(`<!--]-->`);
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

														$$renderer.push(`</div> `);

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: 'small-form-framework',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Framework`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Popover.Root) {
																		$$renderer.push('<!--[-->');

																		Popover.Root($$renderer, {
																			get open() {
																				return frameworkOpen;
																			},

																			set open($$value) {
																				frameworkOpen = $$value;
																				$$settled = false;
																			},

																			children: ($$renderer) => {
																				if (Popover.Trigger) {
																					$$renderer.push('<!--[-->');

																					Popover.Trigger($$renderer, {
																						role: 'combobox',
																						class: cn(buttonVariants({ variant: "outline" }), "w-full justify-between", !frameworkValue && "text-muted-foreground"),
																						get ref() {
																							return triggerRef;
																						},

																						set ref($$value) {
																							triggerRef = $$value;
																							$$settled = false;
																						},

																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(selectedFramework() || "Select a framework")} `);

																							IconPlaceholder($$renderer, {
																								lucide: 'ChevronDownIcon',
																								tabler: 'IconSelector',
																								hugeicons: 'UnfoldMoreIcon',
																								phosphor: 'CaretDownIcon',
																								remixicon: 'RiArrowDownSLine'
																							});

																							$$renderer.push(`<!---->`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Popover.Content) {
																					$$renderer.push('<!--[-->');

																					Popover.Content($$renderer, {
																						class: 'w-(--bits-popover-anchor-width) p-0',
																						children: ($$renderer) => {
																							if (Command.Root) {
																								$$renderer.push('<!--[-->');

																								Command.Root($$renderer, {
																									children: ($$renderer) => {
																										if (Command.Input) {
																											$$renderer.push('<!--[-->');
																											Command.Input($$renderer, { autofocus: true, placeholder: 'Search framework...' });
																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Command.Empty) {
																											$$renderer.push('<!--[-->');

																											Command.Empty($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->No frameworks found.`);
																												},
																												$$slots: { default: true }
																											});

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
																													if (Command.Group) {
																														$$renderer.push('<!--[-->');

																														Command.Group($$renderer, {
																															children: ($$renderer) => {
																																$$renderer.push(`<!--[-->`);

																																const each_array_1 = $.ensure_array_like(frameworks);

																																for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																																	let framework = each_array_1[$$index_1];

																																	if (Command.Item) {
																																		$$renderer.push('<!--[-->');

																																		Command.Item($$renderer, {
																																			value: framework,
																																			'data-checked': frameworkValue === framework.toLowerCase(),
																																			onSelect: () => {
																																				frameworkValue = framework.toLowerCase();
																																				closeAndFocusTrigger();
																																			},

																																			children: ($$renderer) => {
																																				$$renderer.push(`<!---->${$.escape(framework)}`);
																																			},
																																			$$slots: { default: true }
																																		});

																																		$$renderer.push('<!--]-->');
																																	} else {
																																		$$renderer.push('<!--[!-->');
																																		$$renderer.push('<!--]-->');
																																	}
																																}

																																$$renderer.push(`<!--]-->`);
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

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: 'small-form-comments',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Comments`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	Textarea($$renderer, {
																		id: 'small-form-comments',
																		placeholder: 'Add any additional comments'
																	});

																	$$renderer.push(`<!---->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																orientation: 'horizontal',
																children: ($$renderer) => {
																	Button($$renderer, {
																		type: 'submit',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Submit`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	Button($$renderer, {
																		variant: 'outline',
																		type: 'button',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Cancel`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!---->`);
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

											$$renderer.push(`</form>`);
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
	});
}