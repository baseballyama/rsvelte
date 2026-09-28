import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

export default function Sidebar_nav($$renderer) {
	$$renderer.push(`<div class="grid grid-cols-2 items-start gap-6">`);

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: 'overflow-hidden py-0',
			children: ($$renderer) => {
				if (Sidebar.Provider) {
					$$renderer.push('<!--[-->');

					Sidebar.Provider($$renderer, {
						class: 'min-h-0',
						children: ($$renderer) => {
							if (Sidebar.Root) {
								$$renderer.push('<!--[-->');

								Sidebar.Root($$renderer, {
									collapsible: 'none',
									class: 'w-full bg-transparent',
									children: ($$renderer) => {
										if (Sidebar.Content) {
											$$renderer.push('<!--[-->');

											Sidebar.Content($$renderer, {
												class: 'gap-0',
												children: ($$renderer) => {
													if (Sidebar.Group) {
														$$renderer.push('<!--[-->');

														Sidebar.Group($$renderer, {
															class: 'pb-1',
															children: ($$renderer) => {
																if (Sidebar.GroupLabel) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupLabel($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Overview`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Sidebar.GroupContent) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupContent($$renderer, {
																		children: ($$renderer) => {
																			if (Sidebar.Menu) {
																				$$renderer.push('<!--[-->');

																				Sidebar.Menu($$renderer, {
																					children: ($$renderer) => {
																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											isActive: true,
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'LayoutDashboardIcon',
																													tabler: 'IconLayoutDashboard',
																													hugeicons: 'DashboardSquare01Icon',
																													phosphor: 'SquaresFourIcon',
																													remixicon: 'RiDashboardLine'
																												});

																												$$renderer.push(`<!----> Dashboard`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'ArrowLeftRightIcon',
																													tabler: 'IconArrowsLeftRight',
																													hugeicons: 'ArrowDataTransferHorizontalIcon',
																													phosphor: 'ArrowsLeftRightIcon',
																													remixicon: 'RiArrowLeftRightLine'
																												});

																												$$renderer.push(`<!----> Transactions`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'TrendingUpIcon',
																													tabler: 'IconTrendingUp',
																													hugeicons: 'AnalyticsUpIcon',
																													phosphor: 'TrendUpIcon',
																													remixicon: 'RiLineChartLine'
																												});

																												$$renderer.push(`<!----> Investments`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'Building2Icon',
																													tabler: 'IconBuildingBank',
																													hugeicons: 'BankIcon',
																													phosphor: 'BankIcon',
																													remixicon: 'RiBankLine'
																												});

																												$$renderer.push(`<!----> Accounts`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'PieChartIcon',
																													tabler: 'IconChartPie',
																													hugeicons: 'PieChartIcon',
																													phosphor: 'ChartPieIcon',
																													remixicon: 'RiPieChartLine'
																												});

																												$$renderer.push(`<!----> Spending`);
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

													if (Sidebar.Separator) {
														$$renderer.push('<!--[-->');
														Sidebar.Separator($$renderer, { class: 'w-auto!' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Sidebar.Group) {
														$$renderer.push('<!--[-->');

														Sidebar.Group($$renderer, {
															class: 'pt-1',
															children: ($$renderer) => {
																if (Sidebar.GroupLabel) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupLabel($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Planning`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Sidebar.GroupContent) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupContent($$renderer, {
																		children: ($$renderer) => {
																			if (Sidebar.Menu) {
																				$$renderer.push('<!--[-->');

																				Sidebar.Menu($$renderer, {
																					children: ($$renderer) => {
																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'TargetIcon',
																													tabler: 'IconTarget',
																													hugeicons: 'Target02Icon',
																													phosphor: 'TargetIcon',
																													remixicon: 'RiFocus3Line'
																												});

																												$$renderer.push(`<!----> Goals`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'WalletIcon',
																													tabler: 'IconWallet',
																													hugeicons: 'Wallet01Icon',
																													phosphor: 'WalletIcon',
																													remixicon: 'RiWalletLine'
																												});

																												$$renderer.push(`<!----> Budget`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'FileBarChartIcon',
																													tabler: 'IconReportAnalytics',
																													hugeicons: 'ChartBarLineIcon',
																													phosphor: 'ChartBarIcon',
																													remixicon: 'RiBarChartLine'
																												});

																												$$renderer.push(`<!----> Reports`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'FileTextIcon',
																													tabler: 'IconFileText',
																													hugeicons: 'File02Icon',
																													phosphor: 'FileTextIcon',
																													remixicon: 'RiFileTextLine'
																												});

																												$$renderer.push(`<!----> Documents`);
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

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: 'overflow-hidden py-0',
			children: ($$renderer) => {
				if (Sidebar.Provider) {
					$$renderer.push('<!--[-->');

					Sidebar.Provider($$renderer, {
						class: 'min-h-0',
						children: ($$renderer) => {
							if (Sidebar.Root) {
								$$renderer.push('<!--[-->');

								Sidebar.Root($$renderer, {
									collapsible: 'none',
									class: 'w-full bg-transparent',
									children: ($$renderer) => {
										if (Sidebar.Content) {
											$$renderer.push('<!--[-->');

											Sidebar.Content($$renderer, {
												class: 'gap-0',
												children: ($$renderer) => {
													if (Sidebar.Group) {
														$$renderer.push('<!--[-->');

														Sidebar.Group($$renderer, {
															class: 'pb-1',
															children: ($$renderer) => {
																if (Sidebar.GroupLabel) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupLabel($$renderer, {
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

																if (Sidebar.GroupContent) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupContent($$renderer, {
																		children: ($$renderer) => {
																			if (Sidebar.Menu) {
																				$$renderer.push('<!--[-->');

																				Sidebar.Menu($$renderer, {
																					children: ($$renderer) => {
																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'UserIcon',
																													tabler: 'IconUser',
																													hugeicons: 'UserIcon',
																													phosphor: 'UserIcon',
																													remixicon: 'RiUserLine'
																												});

																												$$renderer.push(`<!----> Profile`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											isActive: true,
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
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'BellIcon',
																													tabler: 'IconBell',
																													hugeicons: 'Notification03Icon',
																													phosphor: 'BellIcon',
																													remixicon: 'RiBellLine'
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
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'ShieldIcon',
																													tabler: 'IconShield',
																													hugeicons: 'ShieldIcon',
																													phosphor: 'ShieldIcon',
																													remixicon: 'RiShieldLine'
																												});

																												$$renderer.push(`<!----> Security`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'PaintbrushIcon',
																													tabler: 'IconPalette',
																													hugeicons: 'PaintBoardIcon',
																													phosphor: 'PaletteIcon',
																													remixicon: 'RiPaletteLine'
																												});

																												$$renderer.push(`<!----> Appearance`);
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

													if (Sidebar.Separator) {
														$$renderer.push('<!--[-->');
														Sidebar.Separator($$renderer, { class: 'w-auto!' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Sidebar.Group) {
														$$renderer.push('<!--[-->');

														Sidebar.Group($$renderer, {
															class: 'pt-1',
															children: ($$renderer) => {
																if (Sidebar.GroupLabel) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupLabel($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Support`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Sidebar.GroupContent) {
																	$$renderer.push('<!--[-->');

																	Sidebar.GroupContent($$renderer, {
																		children: ($$renderer) => {
																			if (Sidebar.Menu) {
																				$$renderer.push('<!--[-->');

																				Sidebar.Menu($$renderer, {
																					children: ($$renderer) => {
																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'CircleHelpIcon',
																													tabler: 'IconHelp',
																													hugeicons: 'HelpCircleIcon',
																													phosphor: 'QuestionIcon',
																													remixicon: 'RiQuestionLine'
																												});

																												$$renderer.push(`<!----> Help Center`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'MessageSquareIcon',
																													tabler: 'IconMessage',
																													hugeicons: 'Message01Icon',
																													phosphor: 'ChatIcon',
																													remixicon: 'RiChat1Line'
																												});

																												$$renderer.push(`<!----> Contact Us`);
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'BookOpenIcon',
																													tabler: 'IconBook',
																													hugeicons: 'BookOpen02Icon',
																													phosphor: 'BookOpenIcon',
																													remixicon: 'RiBookOpenLine'
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

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								children: ($$renderer) => {
																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');

																										Sidebar.MenuButton($$renderer, {
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'ActivityIcon',
																													tabler: 'IconActivity',
																													hugeicons: 'ActivityIcon',
																													phosphor: 'PulseIcon',
																													remixicon: 'RiPulseLine'
																												});

																												$$renderer.push(`<!----> Status`);
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
}