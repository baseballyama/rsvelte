import * as $ from 'svelte/internal/server';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Nav_main($$renderer, $$props) {
	let { items } = $$props;

	if (Sidebar.Group) {
		$$renderer.push('<!--[-->');

		Sidebar.Group($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.GroupLabel) {
					$$renderer.push('<!--[-->');

					Sidebar.GroupLabel($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Platform`);
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

							for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
								let item = each_array[$$index_1];

								{
									function child($$renderer, { props }) {
										if (Sidebar.MenuItem) {
											$$renderer.push('<!--[-->');

											Sidebar.MenuItem($$renderer, $.spread_props([
												props,
												{
													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																$$renderer.push(`<a${$.attributes({ href: item.url, ...props })}>`);

																if (item.icon) {
																	$$renderer.push('<!--[-->');
																	item.icon($$renderer, {});
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <span>${$.escape(item.title)}</span></a>`);
															}

															if (Sidebar.MenuButton) {
																$$renderer.push('<!--[-->');
																Sidebar.MenuButton($$renderer, { tooltipContent: item.title, child, $$slots: { child: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);

														if (item.items?.length) {
															$$renderer.push('<!--[0-->');

															{
																function child($$renderer, { props }) {
																	if (Sidebar.MenuAction) {
																		$$renderer.push('<!--[-->');

																		Sidebar.MenuAction($$renderer, $.spread_props([
																			props,
																			{
																				class: 'data-[state=open]:rotate-90',
																				children: ($$renderer) => {
																					ChevronRightIcon($$renderer, {});
																					$$renderer.push(`<!----> <span class="sr-only">Toggle</span>`);
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

																if (Collapsible.Trigger) {
																	$$renderer.push('<!--[-->');
																	Collapsible.Trigger($$renderer, { child, $$slots: { child: true } });
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
																		if (Sidebar.MenuSub) {
																			$$renderer.push('<!--[-->');

																			Sidebar.MenuSub($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_1 = $.ensure_array_like(item.items);

																					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																						let subItem = each_array_1[$$index];

																						if (Sidebar.MenuSubItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuSubItem($$renderer, {
																								children: ($$renderer) => {
																									{
																										function child($$renderer, { props }) {
																											$$renderer.push(`<a${$.attributes({ href: subItem.url, ...props })}><span>${$.escape(subItem.title)}</span></a>`);
																										}

																										if (Sidebar.MenuSubButton) {
																											$$renderer.push('<!--[-->');
																											Sidebar.MenuSubButton($$renderer, { child, $$slots: { child: true } });
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
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
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

									if (Collapsible.Root) {
										$$renderer.push('<!--[-->');
										Collapsible.Root($$renderer, { open: item.isActive, child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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
}