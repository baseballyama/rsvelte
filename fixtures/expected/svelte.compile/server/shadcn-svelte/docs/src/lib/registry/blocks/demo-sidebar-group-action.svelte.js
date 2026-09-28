import * as $ from 'svelte/internal/server';
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import FrameIcon from "@lucide/svelte/icons/frame";
import MapIcon from "@lucide/svelte/icons/map";
import PlusIcon from "@lucide/svelte/icons/plus";
import { toast } from "svelte-sonner";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Toaster } from "$lib/registry/ui/sonner/index.js";

export default function Demo_sidebar_group_action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Sidebar.Provider) {
			$$renderer.push('<!--[-->');

			Sidebar.Provider($$renderer, {
				children: ($$renderer) => {
					Toaster($$renderer, {
						position: 'bottom-left',
						toastOptions: { class: "ms-[160px]" }
					});

					$$renderer.push(`<!----> `);

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
																	$$renderer.push(`<!---->Projects`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Sidebar.GroupAction) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupAction($$renderer, {
																title: 'Add Project',
																onclick: () => toast("You clicked the group action!"),
																children: ($$renderer) => {
																	PlusIcon($$renderer, {});
																	$$renderer.push(`<!----> <span class="sr-only">Add Project</span>`);
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
																							{
																								function child($$renderer, { props }) {
																									$$renderer.push(`<a${$.attributes({ href: '##', ...props })}>`);
																									FrameIcon($$renderer, {});
																									$$renderer.push(`<!----> <span>Design Engineering</span></a>`);
																								}

																								if (Sidebar.MenuButton) {
																									$$renderer.push('<!--[-->');
																									Sidebar.MenuButton($$renderer, { child, $$slots: { child: true } });
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

																				$$renderer.push(` `);

																				if (Sidebar.MenuItem) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuItem($$renderer, {
																						children: ($$renderer) => {
																							{
																								function child($$renderer, { props }) {
																									$$renderer.push(`<a${$.attributes({ href: '##', ...props })}>`);
																									ChartPieIcon($$renderer, {});
																									$$renderer.push(`<!----> <span>Sales &amp; Marketing</span></a>`);
																								}

																								if (Sidebar.MenuButton) {
																									$$renderer.push('<!--[-->');
																									Sidebar.MenuButton($$renderer, { child, $$slots: { child: true } });
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

																				$$renderer.push(` `);

																				if (Sidebar.MenuItem) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuItem($$renderer, {
																						children: ($$renderer) => {
																							{
																								function child($$renderer, { props }) {
																									$$renderer.push(`<a${$.attributes({ href: '##', ...props })}>`);
																									MapIcon($$renderer, {});
																									$$renderer.push(`<!----> <span>Travel</span></a>`);
																								}

																								if (Sidebar.MenuButton) {
																									$$renderer.push('<!--[-->');
																									Sidebar.MenuButton($$renderer, { child, $$slots: { child: true } });
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
	});
}