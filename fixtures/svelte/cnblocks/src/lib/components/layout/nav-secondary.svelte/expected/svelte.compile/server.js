import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/components/ui/sidebar/index.js";

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
																			$$renderer.push(`<a${$.attributes({
																				href: item.url,
																				target: item.external ? "_blank" : undefined,
																				rel: item.external ? "noopener noreferrer" : undefined,
																				...props
																			})}>`);

																			if (item.icon) {
																				$$renderer.push('<!--[-->');
																				item.icon($$renderer, { class: 'size-4! text-cyan-400' });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` <span>${$.escape(item.title)}</span></a>`);
																		}

																		if (Sidebar.MenuButton) {
																			$$renderer.push('<!--[-->');

																			Sidebar.MenuButton($$renderer, {
																				size: 'sm',
																				class: 'bg-secondary/80 py-4 ',
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