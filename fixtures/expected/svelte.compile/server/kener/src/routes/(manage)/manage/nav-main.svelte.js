import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import { page } from "$app/state";

export default function Nav_main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

																	Sidebar.MenuButton($$renderer, {
																		tooltipContent: item.title,
																		isActive: page.url.pathname.startsWith(item.url),
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
	});
}