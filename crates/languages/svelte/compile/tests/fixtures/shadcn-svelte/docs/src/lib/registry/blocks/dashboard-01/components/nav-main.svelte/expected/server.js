import * as $ from 'svelte/internal/server';
import CirclePlusFilledIcon from "@tabler/icons-svelte/icons/circle-plus-filled";
import MailIcon from "@tabler/icons-svelte/icons/mail";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Nav_main($$renderer, $$props) {
	let { items } = $$props;

	if (Sidebar.Group) {
		$$renderer.push('<!--[-->');

		Sidebar.Group($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.GroupContent) {
					$$renderer.push('<!--[-->');

					Sidebar.GroupContent($$renderer, {
						class: 'flex flex-col gap-2',
						children: ($$renderer) => {
							if (Sidebar.Menu) {
								$$renderer.push('<!--[-->');

								Sidebar.Menu($$renderer, {
									children: ($$renderer) => {
										if (Sidebar.MenuItem) {
											$$renderer.push('<!--[-->');

											Sidebar.MenuItem($$renderer, {
												class: 'flex items-center gap-2',
												children: ($$renderer) => {
													if (Sidebar.MenuButton) {
														$$renderer.push('<!--[-->');

														Sidebar.MenuButton($$renderer, {
															class: 'min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground',
															tooltipContent: 'Quick create',
															children: ($$renderer) => {
																CirclePlusFilledIcon($$renderer, {});
																$$renderer.push(`<!----> <span>Quick Create</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Button($$renderer, {
														size: 'icon',
														class: 'size-8 group-data-[collapsible=icon]:opacity-0',
														variant: 'outline',
														children: ($$renderer) => {
															MailIcon($$renderer, {});
															$$renderer.push(`<!----> <span class="sr-only">Inbox</span>`);
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

							if (Sidebar.Menu) {
								$$renderer.push('<!--[-->');

								Sidebar.Menu($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(items);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let item = each_array[$$index];

											if (Sidebar.MenuItem) {
												$$renderer.push('<!--[-->');

												Sidebar.MenuItem($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.MenuButton) {
															$$renderer.push('<!--[-->');

															Sidebar.MenuButton($$renderer, {
																tooltipContent: item.title,
																children: ($$renderer) => {
																	if (item.icon) {
																		$$renderer.push('<!--[0-->');

																		if (item.icon) {
																			$$renderer.push('<!--[-->');
																			item.icon($$renderer, {});
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--> <span>${$.escape(item.title)}</span>`);
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
}