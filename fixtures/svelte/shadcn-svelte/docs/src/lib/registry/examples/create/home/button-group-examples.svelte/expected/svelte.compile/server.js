import * as $ from 'svelte/internal/server';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_examples($$renderer) {
	let label = "personal";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Button Group',
			class: 'items-center justify-center',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col gap-6">`);

				if (ButtonGroup.Root) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Root($$renderer, {
						children: ($$renderer) => {
							if (ButtonGroup.Root) {
								$$renderer.push('<!--[-->');

								ButtonGroup.Root($$renderer, {
									class: 'hidden sm:flex',
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											size: 'icon-sm',
											'aria-label': 'Go Back',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'ArrowLeftIcon',
													tabler: 'IconArrowLeft',
													hugeicons: 'ArrowLeft01Icon',
													phosphor: 'ArrowLeftIcon',
													remixicon: 'RiArrowLeftLine'
												});
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (ButtonGroup.Root) {
								$$renderer.push('<!--[-->');

								ButtonGroup.Root($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Archive`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											variant: 'outline',
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Report`);
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

							$$renderer.push(` `);

							if (ButtonGroup.Root) {
								$$renderer.push('<!--[-->');

								ButtonGroup.Root($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Snooze`);
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
																{
																	variant: 'outline',
																	size: 'icon-sm',
																	'aria-label': 'More Options'
																},
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
															class: 'w-48',
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
																							lucide: 'MailCheckIcon',
																							tabler: 'IconMailCheck',
																							hugeicons: 'MailValidation01Icon',
																							phosphor: 'EnvelopeIcon',
																							remixicon: 'RiMailCheckLine'
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
																							lucide: 'ArchiveIcon',
																							tabler: 'IconArchive',
																							hugeicons: 'ArchiveIcon',
																							phosphor: 'ArchiveIcon',
																							remixicon: 'RiArchiveLine'
																						});

																						$$renderer.push(`<!----> Archive`);
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
																							lucide: 'ClockIcon',
																							tabler: 'IconClock',
																							hugeicons: 'ClockIcon',
																							phosphor: 'ClockIcon',
																							remixicon: 'RiTimeLine'
																						});

																						$$renderer.push(`<!----> Snooze`);
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
																							lucide: 'CalendarPlusIcon',
																							tabler: 'IconCalendarPlus',
																							hugeicons: 'CalendarAdd01Icon',
																							phosphor: 'CalendarPlusIcon',
																							remixicon: 'RiCalendarCheckLine'
																						});

																						$$renderer.push(`<!----> Add to Calendar`);
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
																							lucide: 'ListFilterIcon',
																							tabler: 'IconFilterPlus',
																							hugeicons: 'AddToListIcon',
																							phosphor: 'ListPlusIcon',
																							remixicon: 'RiAddBoxLine'
																						});

																						$$renderer.push(`<!----> Add to List`);
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
																										lucide: 'TagIcon',
																										tabler: 'IconTag',
																										hugeicons: 'TagIcon',
																										phosphor: 'TagIcon',
																										remixicon: 'RiPriceTagLine'
																									});

																									$$renderer.push(`<!----> Label As...`);
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
																															if (DropdownMenu.RadioGroup) {
																																$$renderer.push('<!--[-->');

																																DropdownMenu.RadioGroup($$renderer, {
																																	get value() {
																																		return label;
																																	},

																																	set value($$value) {
																																		label = $$value;
																																		$$settled = false;
																																	},

																																	children: ($$renderer) => {
																																		if (DropdownMenu.RadioItem) {
																																			$$renderer.push('<!--[-->');

																																			DropdownMenu.RadioItem($$renderer, {
																																				value: 'personal',
																																				children: ($$renderer) => {
																																					$$renderer.push(`<!---->Personal`);
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
																																				value: 'work',
																																				children: ($$renderer) => {
																																					$$renderer.push(`<!---->Work`);
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
																																				value: 'other',
																																				children: ($$renderer) => {
																																					$$renderer.push(`<!---->Other`);
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
																					variant: 'destructive',
																					children: ($$renderer) => {
																						IconPlaceholder($$renderer, {
																							lucide: 'Trash2Icon',
																							tabler: 'IconTrash',
																							hugeicons: 'Delete02Icon',
																							phosphor: 'TrashIcon',
																							remixicon: 'RiDeleteBinLine'
																						});

																						$$renderer.push(`<!----> Trash`);
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

							if (ButtonGroup.Root) {
								$$renderer.push('<!--[-->');

								ButtonGroup.Root($$renderer, {
									class: 'hidden sm:flex',
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											size: 'icon-sm',
											'aria-label': 'Previous',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'ArrowLeftIcon',
													tabler: 'IconArrowLeft',
													hugeicons: 'ArrowLeft01Icon',
													phosphor: 'ArrowLeftIcon',
													remixicon: 'RiArrowLeftLine'
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											variant: 'outline',
											size: 'icon-sm',
											'aria-label': 'Next',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'ArrowRightIcon',
													tabler: 'IconArrowRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'ArrowRightIcon',
													remixicon: 'RiArrowRightLine'
												});
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

				$$renderer.push(` <div class="flex gap-4">`);

				if (ButtonGroup.Root) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Root($$renderer, {
						class: 'hidden sm:flex',
						children: ($$renderer) => {
							if (ButtonGroup.Root) {
								$$renderer.push('<!--[-->');

								ButtonGroup.Root($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->1`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->2`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->3`);
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

				$$renderer.push(` `);

				if (ButtonGroup.Root) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Root($$renderer, {
						children: ($$renderer) => {
							if (ButtonGroup.Root) {
								$$renderer.push('<!--[-->');

								ButtonGroup.Root($$renderer, {
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
															class: 'w-52',
															children: ($$renderer) => {
																if (DropdownMenu.Group) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Group($$renderer, {
																		children: ($$renderer) => {
																			if (DropdownMenu.Label) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Label($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Quick Actions`);
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
																							lucide: 'UserRoundXIcon',
																							tabler: 'IconUserX',
																							hugeicons: 'UserRemove01Icon',
																							phosphor: 'UserMinusIcon',
																							remixicon: 'RiUserMinusLine'
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
																						$$renderer.push(`<!---->Conversation`);
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
																							remixicon: 'RiAlertLine'
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

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (ButtonGroup.Root) {
								$$renderer.push('<!--[-->');

								ButtonGroup.Root($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'BotIcon',
													tabler: 'IconRobot',
													hugeicons: 'BotIcon',
													phosphor: 'RobotIcon',
													remixicon: 'RiRobotLine'
												});

												$$renderer.push(`<!----> Copilot`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Popover.Root) {
											$$renderer.push('<!--[-->');

											Popover.Root($$renderer, {
												children: ($$renderer) => {
													{
														function child($$renderer, { props }) {
															Button($$renderer, $.spread_props([
																{
																	variant: 'outline',
																	size: 'icon',
																	'aria-label': 'Open Popover'
																},
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

														if (Popover.Trigger) {
															$$renderer.push('<!--[-->');
															Popover.Trigger($$renderer, { child, $$slots: { child: true } });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(` `);

													if (Popover.Content) {
														$$renderer.push('<!--[-->');

														Popover.Content($$renderer, {
															align: 'end',
															class: 'w-96',
															children: ($$renderer) => {
																if (Popover.Header) {
																	$$renderer.push('<!--[-->');

																	Popover.Header($$renderer, {
																		children: ($$renderer) => {
																			if (Popover.Title) {
																				$$renderer.push('<!--[-->');

																				Popover.Title($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Agent Tasks`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Popover.Description) {
																				$$renderer.push('<!--[-->');

																				Popover.Description($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Describe your task in natural language. Copilot will work in the background and
									open a pull request.`);
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

																$$renderer.push(` <div class="text-sm *:[p:not(:last-child)]:mb-2">`);

																Textarea($$renderer, {
																	placeholder: 'Describe your task in natural language.',
																	class: 'min-h-32 resize-none'
																});

																$$renderer.push(`<!----></div>`);
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

				$$renderer.push(`</div></div>`);
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