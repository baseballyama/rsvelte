import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Navbar($$renderer) {
	Example($$renderer, {
		title: 'Account Menu',
		children: ($$renderer) => {
			$$renderer.push(`<header class="flex h-14 w-full items-center gap-2">`);

			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					direction: 'left',
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline', size: 'icon' },
									props,
									{
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'MenuIcon',
												hugeicons: 'Menu09Icon',
												tabler: 'IconMenu',
												phosphor: 'ListIcon',
												remixicon: 'RiMenuLine'
											});

											$$renderer.push(`<!----> <span class="sr-only">Open menu</span>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Drawer.Trigger) {
								$$renderer.push('<!--[-->');
								Drawer.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								class: 'max-w-72',
								children: ($$renderer) => {
									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											class: 'flex flex-row items-center justify-between px-5 pb-0',
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Menu`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'ghost', size: 'icon-sm' },
															props,
															{
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'XIcon',
																		tabler: 'IconX',
																		hugeicons: 'Cancel01Icon',
																		phosphor: 'XIcon',
																		remixicon: 'RiCloseLine'
																	});

																	$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Drawer.Close) {
														$$renderer.push('<!--[-->');
														Drawer.Close($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="p-2">`);

									if (Item.Group) {
										$$renderer.push('<!--[-->');

										Item.Group($$renderer, {
											class: 'gap-px',
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'HomeIcon',
																		tabler: 'IconHome',
																		hugeicons: 'HomeIcon',
																		phosphor: 'HouseIcon',
																		remixicon: 'RiHomeLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Home`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'CircleIcon',
																		tabler: 'IconCircle',
																		hugeicons: 'CircleIcon',
																		phosphor: 'CircleIcon',
																		remixicon: 'RiCircleLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Issues`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'GitBranchIcon',
																		tabler: 'IconGitBranch',
																		hugeicons: 'GitBranchIcon',
																		phosphor: 'GitBranchIcon',
																		remixicon: 'RiGitBranchLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Pull requests`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'LayoutGridIcon',
																		tabler: 'IconLayoutGrid',
																		hugeicons: 'GridIcon',
																		phosphor: 'GridFourIcon',
																		remixicon: 'RiGridLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Projects`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'MailIcon',
																		tabler: 'IconMail',
																		hugeicons: 'MailIcon',
																		phosphor: 'EnvelopeIcon',
																		remixicon: 'RiMailLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Discussions`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'ServerIcon',
																		tabler: 'IconServer',
																		hugeicons: 'ServerStackIcon',
																		phosphor: 'HardDrivesIcon',
																		remixicon: 'RiServerLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Codespaces`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'BotIcon',
																		tabler: 'IconRobot',
																		hugeicons: 'RoboticIcon',
																		phosphor: 'RobotIcon',
																		remixicon: 'RiRobotLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Copilot`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'SparklesIcon',
																		tabler: 'IconSparkles',
																		hugeicons: 'SparklesIcon',
																		phosphor: 'SparkleIcon',
																		remixicon: 'RiSparklingLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Spark`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (Item.Separator) {
													$$renderer.push('<!--[-->');
													Item.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'SearchIcon',
																		tabler: 'IconSearch',
																		hugeicons: 'SearchIcon',
																		phosphor: 'MagnifyingGlassIcon',
																		remixicon: 'RiSearchLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Explore`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'ShoppingBagIcon',
																		tabler: 'IconShoppingBag',
																		hugeicons: 'ShoppingBasket01Icon',
																		phosphor: 'BagIcon',
																		remixicon: 'RiShoppingBagLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Marketplace`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'LinkIcon',
																		tabler: 'IconLink',
																		hugeicons: 'LinkIcon',
																		phosphor: 'LinkIcon',
																		remixicon: 'RiLink'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->MCP registry`);
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

														$$renderer.push(`</a>`);
													}

													if (Item.Root) {
														$$renderer.push('<!--[-->');
														Item.Root($$renderer, { size: 'xs', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
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

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{
										variant: 'ghost',
										size: 'icon',
										class: 'ml-auto rounded-full'
									},
									props,
									{
										children: ($$renderer) => {
											if (Avatar.Root) {
												$$renderer.push('<!--[-->');

												Avatar.Root($$renderer, {
													children: ($$renderer) => {
														if (Avatar.Image) {
															$$renderer.push('<!--[-->');
															Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', alt: 'shadcn' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Avatar.Fallback) {
															$$renderer.push('<!--[-->');

															Avatar.Fallback($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->SC`);
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
								class: 'w-56',
								align: 'end',
								children: ($$renderer) => {
									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Label) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Label($$renderer, {
														class: 'p-0 font-normal',
														children: ($$renderer) => {
															if (Item.Root) {
																$$renderer.push('<!--[-->');

																Item.Root($$renderer, {
																	class: 'px-2 py-1 pb-0.5',
																	size: 'sm',
																	children: ($$renderer) => {
																		if (Item.Media) {
																			$$renderer.push('<!--[-->');

																			Item.Media($$renderer, {
																				children: ($$renderer) => {
																					if (Avatar.Root) {
																						$$renderer.push('<!--[-->');

																						Avatar.Root($$renderer, {
																							children: ($$renderer) => {
																								if (Avatar.Image) {
																									$$renderer.push('<!--[-->');
																									Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', alt: 'shadcn' });
																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (Avatar.Fallback) {
																									$$renderer.push('<!--[-->');

																									Avatar.Fallback($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->SC`);
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

																		if (Item.Content) {
																			$$renderer.push('<!--[-->');

																			Item.Content($$renderer, {
																				class: 'gap-0',
																				children: ($$renderer) => {
																					if (Item.Title) {
																						$$renderer.push('<!--[-->');

																						Item.Title($$renderer, {
																							class: 'text-sm text-foreground',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->shadcn`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (Item.Description) {
																						$$renderer.push('<!--[-->');

																						Item.Description($$renderer, {
																							class: 'text-xs',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->shadcn@example.com`);
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
																lucide: 'SmileIcon',
																tabler: 'IconMoodSmile',
																hugeicons: 'SmileIcon',
																phosphor: 'SmileyIcon',
																remixicon: 'RiEmotionLine'
															});

															$$renderer.push(`<!----> Set status`);
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
																lucide: 'CircleAlertIcon',
																tabler: 'IconExclamationCircle',
																hugeicons: 'AlertCircleIcon',
																phosphor: 'WarningCircleIcon',
																remixicon: 'RiErrorWarningLine'
															});

															$$renderer.push(`<!----> Single sign-on`);
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

															$$renderer.push(`<!----> Repositories`);
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
																lucide: 'StarIcon',
																tabler: 'IconStar',
																hugeicons: 'StarIcon',
																phosphor: 'StarIcon',
																remixicon: 'RiStarLine'
															});

															$$renderer.push(`<!----> Stars`);
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
																lucide: 'CodeIcon',
																tabler: 'IconCode',
																hugeicons: 'CodeIcon',
																phosphor: 'CodeIcon',
																remixicon: 'RiCodeLine'
															});

															$$renderer.push(`<!----> Gists`);
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

															$$renderer.push(`<!----> Organizations`);
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
																lucide: 'ServerIcon',
																tabler: 'IconServer',
																hugeicons: 'ServerStackIcon',
																phosphor: 'HardDrivesIcon',
																remixicon: 'RiServerLine'
															});

															$$renderer.push(`<!----> Enterprises`);
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
																lucide: 'HeartIcon',
																tabler: 'IconHeart',
																hugeicons: 'FavouriteIcon',
																phosphor: 'HeartIcon',
																remixicon: 'RiHeartLine'
															});

															$$renderer.push(`<!----> Sponsors`);
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

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'BotIcon',
																tabler: 'IconRobot',
																hugeicons: 'RoboticIcon',
																phosphor: 'RobotIcon',
																remixicon: 'RiRobotLine'
															});

															$$renderer.push(`<!----> Copilot settings`);
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
																lucide: 'SparklesIcon',
																tabler: 'IconSparkles',
																hugeicons: 'SparklesIcon',
																phosphor: 'SparkleIcon',
																remixicon: 'RiSparklingLine'
															});

															$$renderer.push(`<!----> Feature preview`);
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
																lucide: 'MonitorIcon',
																tabler: 'IconDeviceDesktop',
																hugeicons: 'ComputerIcon',
																phosphor: 'MonitorIcon',
																remixicon: 'RiComputerLine'
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

															$$renderer.push(`<!----> Accessibility`);
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
																lucide: 'ArrowUpIcon',
																tabler: 'IconArrowUp',
																hugeicons: 'ArrowUpIcon',
																phosphor: 'ArrowUpIcon',
																remixicon: 'RiArrowUpLine'
															});

															$$renderer.push(`<!----> Upgrade`);
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
													lucide: 'LogOutIcon',
													tabler: 'IconLogout',
													hugeicons: 'LogoutIcon',
													phosphor: 'SignOutIcon',
													remixicon: 'RiLogoutBoxLine'
												});

												$$renderer.push(`<!----> Sign out`);
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

			$$renderer.push(`</header>`);
		},
		$$slots: { default: true }
	});
}