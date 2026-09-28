import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Nav_secondary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, items, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Group) {
				$$renderer.push('<!--[-->');

				Sidebar.Group($$renderer, $.spread_props([
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

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

													const each_array = $.ensure_array_like(items);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let item = each_array[$$index];

														if (Sidebar.MenuItem) {
															$$renderer.push('<!--[-->');

															Sidebar.MenuItem($$renderer, {
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
																			Sidebar.MenuButton($$renderer, { child, $$slots: { child: true } });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(` `);

																	if (item.badge) {
																		$$renderer.push('<!--[0-->');

																		if (Sidebar.MenuBadge) {
																			$$renderer.push('<!--[-->');

																			Sidebar.MenuBadge($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(item.badge)}`);
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
					}
				]));

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
		$.bind_props($$props, { ref });
	});
}