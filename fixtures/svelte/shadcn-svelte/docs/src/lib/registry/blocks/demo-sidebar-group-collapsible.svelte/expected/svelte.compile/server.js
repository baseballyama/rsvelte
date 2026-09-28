import * as $ from 'svelte/internal/server';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import SendIcon from "@lucide/svelte/icons/send";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Demo_sidebar_group_collapsible($$renderer) {
	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.Root) {
					$$renderer.push('<!--[-->');

					Sidebar.Root($$renderer, {
						children: ($$renderer) => {
							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									children: ($$renderer) => {
										if (Collapsible.Root) {
											$$renderer.push('<!--[-->');

											Collapsible.Root($$renderer, {
												open: true,
												class: 'group/collapsible',
												children: ($$renderer) => {
													if (Sidebar.Group) {
														$$renderer.push('<!--[-->');

														Sidebar.Group($$renderer, {
															children: ($$renderer) => {
																{
																	function child($$renderer, { props }) {
																		if (Collapsible.Trigger) {
																			$$renderer.push('<!--[-->');

																			Collapsible.Trigger($$renderer, $.spread_props([
																				props,
																				{
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Help `);

																						ChevronDownIcon($$renderer, {
																							class: 'ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180'
																						});

																						$$renderer.push(`<!---->`);
																					},
																					$$slots: { default: true }
																				}
																			]));

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	if (Sidebar.GroupLabel) {
																		$$renderer.push('<!--[-->');

																		Sidebar.GroupLabel($$renderer, {
																			class: 'text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
																			child,
																			$$slots: { child: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}

																$$renderer.push(` `);

																if (Collapsible.Content) {
																	$$renderer.push('<!--[-->');

																	Collapsible.Content($$renderer, {
																		children: ($$renderer) => {
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
																															LifeBuoyIcon($$renderer, {});
																															$$renderer.push(`<!----> Support`);
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
																															SendIcon($$renderer, {});
																															$$renderer.push(`<!----> Feedback`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}