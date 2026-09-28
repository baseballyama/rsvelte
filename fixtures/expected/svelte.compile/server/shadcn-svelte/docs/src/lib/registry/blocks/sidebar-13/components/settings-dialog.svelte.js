import * as $ from 'svelte/internal/server';
import BellIcon from "@lucide/svelte/icons/bell";
import CheckIcon from "@lucide/svelte/icons/check";
import GlobeIcon from "@lucide/svelte/icons/globe";
import HouseIcon from "@lucide/svelte/icons/house";
import KeyboardIcon from "@lucide/svelte/icons/keyboard";
import LinkIcon from "@lucide/svelte/icons/link";
import LockIcon from "@lucide/svelte/icons/lock";
import MenuIcon from "@lucide/svelte/icons/menu";
import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
import PaintbrushIcon from "@lucide/svelte/icons/paintbrush";
import SettingsIcon from "@lucide/svelte/icons/settings";
import VideoIcon from "@lucide/svelte/icons/video";
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Settings_dialog($$renderer) {
	const data = {
		nav: [
			{ name: "Notifications", icon: BellIcon },
			{ name: "Navigation", icon: MenuIcon },
			{ name: "Home", icon: HouseIcon },
			{ name: "Appearance", icon: PaintbrushIcon },
			{ name: "Messages & media", icon: MessageCircleIcon },
			{ name: "Language & region", icon: GlobeIcon },
			{ name: "Accessibility", icon: KeyboardIcon },
			{ name: "Mark as read", icon: CheckIcon },
			{ name: "Audio & video", icon: VideoIcon },
			{ name: "Connected accounts", icon: LinkIcon },
			{ name: "Privacy & visibility", icon: LockIcon },
			{ name: "Advanced", icon: SettingsIcon }
		]
	};

	let open = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{ size: 'sm' },
								props,
								{
									children: ($$renderer) => {
										$$renderer.push(`<!---->Open Dialog`);
									},
									$$slots: { default: true }
								}
							]));
						}

						if (Dialog.Trigger) {
							$$renderer.push('<!--[-->');
							Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(` `);

					if (Dialog.Content) {
						$$renderer.push('<!--[-->');

						Dialog.Content($$renderer, {
							class: 'overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]',
							trapFocus: false,
							children: ($$renderer) => {
								if (Dialog.Title) {
									$$renderer.push('<!--[-->');

									Dialog.Title($$renderer, {
										class: 'sr-only',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Settings`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Dialog.Description) {
									$$renderer.push('<!--[-->');

									Dialog.Description($$renderer, {
										class: 'sr-only',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Customize your settings here.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Sidebar.Provider) {
									$$renderer.push('<!--[-->');

									Sidebar.Provider($$renderer, {
										class: 'items-start',
										children: ($$renderer) => {
											if (Sidebar.Root) {
												$$renderer.push('<!--[-->');

												Sidebar.Root($$renderer, {
													collapsible: 'none',
													class: 'hidden md:flex',
													children: ($$renderer) => {
														if (Sidebar.Content) {
															$$renderer.push('<!--[-->');

															Sidebar.Content($$renderer, {
																children: ($$renderer) => {
																	if (Sidebar.Group) {
																		$$renderer.push('<!--[-->');

																		Sidebar.Group($$renderer, {
																			children: ($$renderer) => {
																				if (Sidebar.GroupContent) {
																					$$renderer.push('<!--[-->');

																					Sidebar.GroupContent($$renderer, {
																						children: ($$renderer) => {
																							if (Sidebar.Menu) {
																								$$renderer.push('<!--[-->');

																								Sidebar.Menu($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!--[-->`);

																										const each_array = $.ensure_array_like(data.nav);

																										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																											let item = each_array[$$index];

																											if (Sidebar.MenuItem) {
																												$$renderer.push('<!--[-->');

																												Sidebar.MenuItem($$renderer, {
																													children: ($$renderer) => {
																														{
																															function child($$renderer, { props }) {
																																$$renderer.push(`<a${$.attributes({ href: '##', ...props })}>`);

																																if (item.icon) {
																																	$$renderer.push('<!--[-->');
																																	item.icon($$renderer, {});
																																	$$renderer.push('<!--]-->');
																																} else {
																																	$$renderer.push('<!--[!-->');
																																	$$renderer.push('<!--]-->');
																																}

																																$$renderer.push(` <span>${$.escape(item.name)}</span></a>`);
																															}

																															if (Sidebar.MenuButton) {
																																$$renderer.push('<!--[-->');

																																Sidebar.MenuButton($$renderer, {
																																	isActive: item.name === "Messages & media",
																																	child,
																																	$$slots: { child: true }
																																});

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

											$$renderer.push(` <main class="flex h-[480px] flex-1 flex-col overflow-hidden"><header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"><div class="flex items-center gap-2 px-4">`);

											if (Breadcrumb.Root) {
												$$renderer.push('<!--[-->');

												Breadcrumb.Root($$renderer, {
													children: ($$renderer) => {
														if (Breadcrumb.List) {
															$$renderer.push('<!--[-->');

															Breadcrumb.List($$renderer, {
																children: ($$renderer) => {
																	if (Breadcrumb.Item) {
																		$$renderer.push('<!--[-->');

																		Breadcrumb.Item($$renderer, {
																			class: 'hidden md:block',
																			children: ($$renderer) => {
																				if (Breadcrumb.Link) {
																					$$renderer.push('<!--[-->');

																					Breadcrumb.Link($$renderer, {
																						href: '##',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Settings`);
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

																	if (Breadcrumb.Separator) {
																		$$renderer.push('<!--[-->');
																		Breadcrumb.Separator($$renderer, { class: 'hidden md:block' });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Breadcrumb.Item) {
																		$$renderer.push('<!--[-->');

																		Breadcrumb.Item($$renderer, {
																			children: ($$renderer) => {
																				if (Breadcrumb.Page) {
																					$$renderer.push('<!--[-->');

																					Breadcrumb.Page($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Messages &amp; media`);
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

											$$renderer.push(`</div></header> <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0"><!--[-->`);

											const each_array_1 = $.ensure_array_like(Array.from({ length: 10 }));

											for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
												let _ = each_array_1[i];

												$$renderer.push(`<div class="aspect-video max-w-3xl rounded-xl bg-muted/50"></div>`);
											}

											$$renderer.push(`<!--]--></div></main>`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}