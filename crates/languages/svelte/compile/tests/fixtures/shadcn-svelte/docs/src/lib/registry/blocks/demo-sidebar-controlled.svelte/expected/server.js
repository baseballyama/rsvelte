import * as $ from 'svelte/internal/server';
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import FrameIcon from "@lucide/svelte/icons/frame";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import MapIcon from "@lucide/svelte/icons/map";
import PanelLeftCloseIcon from "@lucide/svelte/icons/panel-left-close";
import PanelLeftOpenIcon from "@lucide/svelte/icons/panel-left-open";
import SendIcon from "@lucide/svelte/icons/send";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Demo_sidebar_controlled($$renderer) {
	const projects = [
		{ name: "Design Engineering", url: "#", icon: FrameIcon },
		{ name: "Sales & Marketing", url: "#", icon: ChartPieIcon },
		{ name: "Travel", url: "#", icon: MapIcon },
		{ name: "Support", url: "#", icon: LifeBuoyIcon },
		{ name: "Feedback", url: "#", icon: SendIcon }
	];

	let open = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		var bind_get = () => open;
		var bind_set = (v) => open = v;

		if (Sidebar.Provider) {
			$$renderer.push('<!--[-->');

			Sidebar.Provider($$renderer, {
				get open() {
					return bind_get();
				},

				set open($$value) {
					bind_set($$value);
				},

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

					$$renderer.push(` `);

					if (Sidebar.Inset) {
						$$renderer.push('<!--[-->');

						Sidebar.Inset($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<header class="flex h-12 items-center justify-between px-4">`);

								Button($$renderer, {
									onclick: () => open = !open,
									size: 'sm',
									variant: 'ghost',
									children: ($$renderer) => {
										if (open) {
											$$renderer.push('<!--[0-->');
											PanelLeftCloseIcon($$renderer, {});
										} else {
											$$renderer.push('<!--[-1-->');
											PanelLeftOpenIcon($$renderer, {});
										}

										$$renderer.push(`<!--]--> <span>${$.escape(open ? "Close" : "Open")} Sidebar</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></header>`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}