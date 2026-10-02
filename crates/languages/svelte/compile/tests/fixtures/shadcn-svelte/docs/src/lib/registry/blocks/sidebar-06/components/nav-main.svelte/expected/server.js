import * as $ from 'svelte/internal/server';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { useSidebar } from "$lib/registry/ui/sidebar/index.js";

export default function Nav_main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		const sidebar = useSidebar();

		if (Sidebar.Group) {
			$$renderer.push('<!--[-->');

			Sidebar.Group($$renderer, {
				children: ($$renderer) => {
					if (Sidebar.Menu) {
						$$renderer.push('<!--[-->');

						Sidebar.Menu($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(items);

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let item = each_array[$$index_1];

									if (DropdownMenu.Root) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Root($$renderer, {
											children: ($$renderer) => {
												if (Sidebar.MenuItem) {
													$$renderer.push('<!--[-->');

													Sidebar.MenuItem($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	if (Sidebar.MenuButton) {
																		$$renderer.push('<!--[-->');

																		Sidebar.MenuButton($$renderer, $.spread_props([
																			{
																				class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
																			},
																			props,
																			{
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(item.title)} `);
																					EllipsisIcon($$renderer, { class: 'ms-auto' });
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

															if (item.items?.length) {
																$$renderer.push('<!--[0-->');

																if (DropdownMenu.Content) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Content($$renderer, {
																		side: sidebar.isMobile ? "bottom" : "right",
																		align: sidebar.isMobile ? "end" : "start",
																		class: 'min-w-56 rounded-lg',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_1 = $.ensure_array_like(item.items);

																			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																				let subItem = each_array_1[$$index];

																				{
																					function child($$renderer, { props }) {
																						$$renderer.push(`<a${$.attributes({ href: subItem.url, ...props })}>${$.escape(subItem.title)}</a>`);
																					}

																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');
																						DropdownMenu.Item($$renderer, { child, $$slots: { child: true } });
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
															} else {
																$$renderer.push('<!--[-1-->');
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
	});
}