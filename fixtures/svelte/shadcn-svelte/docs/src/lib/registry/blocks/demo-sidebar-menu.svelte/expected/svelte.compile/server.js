import * as $ from 'svelte/internal/server';
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import FrameIcon from "@lucide/svelte/icons/frame";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import MapIcon from "@lucide/svelte/icons/map";
import SendIcon from "@lucide/svelte/icons/send";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Demo_sidebar_menu($$renderer) {
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