import * as $ from 'svelte/internal/server';
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import FrameIcon from "@lucide/svelte/icons/frame";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import MapIcon from "@lucide/svelte/icons/map";
import SendIcon from "@lucide/svelte/icons/send";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Demo_sidebar_menu_action($$renderer) {
	const projects = [
		{ name: "Design Engineering", url: "#", icon: FrameIcon },
		{ name: "Sales & Marketing", url: "#", icon: ChartPieIcon },
		{ name: "Travel", url: "#", icon: MapIcon },
		{ name: "Support", url: "#", icon: LifeBuoyIcon },
		{ name: "Feedback", url: "#", icon: SendIcon }
	];

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

													if (Sidebar.GroupContent) {
														$$renderer.push('<!--[-->');

														Sidebar.GroupContent($$renderer, {
															children: ($$renderer) => {
																if (Sidebar.Menu) {
																	$$renderer.push('<!--[-->');

																	Sidebar.Menu($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array = $.ensure_array_like(projects);

																			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																				let project = each_array[$$index];

																				if (Sidebar.MenuItem) {
																					$$renderer.push('<!--[-->');

																					Sidebar.MenuItem($$renderer, {
																						children: ($$renderer) => {
																							{
																								function child($$renderer, { props }) {
																									$$renderer.push(`<a${$.attributes({ href: project.url, ...props })}>`);

																									if (project.icon) {
																										$$renderer.push('<!--[-->');
																										project.icon($$renderer, {});
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` <span>${$.escape(project.name)}</span></a>`);
																								}

																								if (Sidebar.MenuButton) {
																									$$renderer.push('<!--[-->');

																									Sidebar.MenuButton($$renderer, {
																										class: 'group-has-[[data-state=open]]/menu-item:bg-sidebar-accent',
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

																							if (DropdownMenu.Root) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Root($$renderer, {
																									children: ($$renderer) => {
																										{
																											function child($$renderer, { props }) {
																												if (Sidebar.MenuAction) {
																													$$renderer.push('<!--[-->');

																													Sidebar.MenuAction($$renderer, $.spread_props([
																														props,
																														{
																															children: ($$renderer) => {
																																EllipsisIcon($$renderer, {});
																																$$renderer.push(`<!----> <span class="sr-only">More</span>`);
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
																												side: 'right',
																												align: 'start',
																												children: ($$renderer) => {
																													if (DropdownMenu.Item) {
																														$$renderer.push('<!--[-->');

																														DropdownMenu.Item($$renderer, {
																															children: ($$renderer) => {
																																$$renderer.push(`<span>Edit Project</span>`);
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
																																$$renderer.push(`<span>Delete Project</span>`);
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
}