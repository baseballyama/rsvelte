import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_dropdown($$renderer) {
	Example($$renderer, {
		title: 'With Dropdown',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Update`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'outline', size: 'icon' },
											props,
											{
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
														lucide: 'ChevronDownIcon',
														tabler: 'IconChevronDown',
														hugeicons: 'ArrowDown01Icon',
														phosphor: 'CaretDownIcon',
														remixicon: 'RiArrowDownSLine'
													});
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
										children: ($$renderer) => {
											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Disable`);
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
													variant: 'destructive',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Uninstall`);
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

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Follow`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'outline', size: 'icon' },
											props,
											{
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
														lucide: 'ChevronDownIcon',
														tabler: 'IconChevronDown',
														hugeicons: 'ArrowDown01Icon',
														phosphor: 'CaretDownIcon',
														remixicon: 'RiArrowDownSLine'
													});
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
										class: 'w-50',
										children: ($$renderer) => {
											if (DropdownMenu.Group) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Group($$renderer, {
													children: ($$renderer) => {
														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'VolumeX',
																		tabler: 'IconVolume',
																		hugeicons: 'VolumeOffIcon',
																		phosphor: 'SpeakerSlashIcon',
																		remixicon: 'RiVolumeMuteLine'
																	});

																	$$renderer.push(`<!----> Mute Conversation`);
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
																		lucide: 'CheckIcon',
																		tabler: 'IconCheck',
																		hugeicons: 'Tick02Icon',
																		phosphor: 'CheckIcon',
																		remixicon: 'RiCheckLine'
																	});

																	$$renderer.push(`<!----> Mark as Read`);
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
																		lucide: 'AlertTriangleIcon',
																		tabler: 'IconAlertTriangle',
																		hugeicons: 'AlertCircleIcon',
																		phosphor: 'WarningIcon',
																		remixicon: 'RiErrorWarningLine'
																	});

																	$$renderer.push(`<!----> Report Conversation`);
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
																		lucide: 'UserRoundXIcon',
																		tabler: 'IconUserX',
																		hugeicons: 'UserRemove01Icon',
																		phosphor: 'UserMinusIcon',
																		remixicon: 'RiUserUnfollowLine'
																	});

																	$$renderer.push(`<!----> Block User`);
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
																		lucide: 'ShareIcon',
																		tabler: 'IconShare',
																		hugeicons: 'Share03Icon',
																		phosphor: 'ShareIcon',
																		remixicon: 'RiShareLine'
																	});

																	$$renderer.push(`<!----> Share Conversation`);
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
																		lucide: 'CopyIcon',
																		tabler: 'IconCopy',
																		hugeicons: 'Copy01Icon',
																		phosphor: 'CopyIcon',
																		remixicon: 'RiFileCopyLine'
																	});

																	$$renderer.push(`<!----> Copy Conversation`);
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
																		lucide: 'TrashIcon',
																		tabler: 'IconTrash',
																		hugeicons: 'Delete02Icon',
																		phosphor: 'TrashIcon',
																		remixicon: 'RiDeleteBinLine'
																	});

																	$$renderer.push(`<!----> Delete Conversation`);
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

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}