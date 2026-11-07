import * as $ from 'svelte/internal/server';
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import SendIcon from "@lucide/svelte/icons/send";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Demo_sidebar_group($$renderer) {
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
										if (Sidebar.Group) {
											$$renderer.push('<!--[-->');

											Sidebar.Group($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.GroupLabel) {
														$$renderer.push('<!--[-->');

														Sidebar.GroupLabel($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Help`);
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
}