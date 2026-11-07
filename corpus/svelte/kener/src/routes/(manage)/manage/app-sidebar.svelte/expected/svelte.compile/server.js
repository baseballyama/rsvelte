import * as $ from 'svelte/internal/server';
import InnerShadowTopIcon from "@lucide/svelte/icons/user";
import NavMain from "./nav-main.svelte";
import NavUser from "./nav-user.svelte";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import version from "$lib/version";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function App_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { navItems, $$slots, $$events, ...restProps } = $$props;
		const appVersion = version();

		if (Sidebar.Root) {
			$$renderer.push('<!--[-->');

			Sidebar.Root($$renderer, $.spread_props([
				{ collapsible: 'offcanvas' },
				restProps,
				{
					children: ($$renderer) => {
						if (Sidebar.Header) {
							$$renderer.push('<!--[-->');

							Sidebar.Header($$renderer, {
								children: ($$renderer) => {
									if (Sidebar.Menu) {
										$$renderer.push('<!--[-->');

										Sidebar.Menu($$renderer, {
											children: ($$renderer) => {
												if (Sidebar.MenuItem) {
													$$renderer.push('<!--[-->');

													Sidebar.MenuItem($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	$$renderer.push(`<a${$.attributes({
																		href: clientResolver(resolve, "/manage/app/site-configurations"),
																		...props,
																		class: 'justify-start-safe flex items-center gap-2'
																	})}><img${$.attr('src', clientResolver(resolve, "/logo96.png"))} class="size-5!" alt="Kener Logo"/> <span class="text-base font-semibold">Kener</span> <span class="text-muted-foreground pt-0.5 text-xs font-medium">v${$.escape(appVersion)}</span></a>`);
																}

																if (Sidebar.MenuButton) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuButton($$renderer, {
																		class: 'data-[slot=sidebar-menu-button]:p-1.5!',
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

						if (Sidebar.Content) {
							$$renderer.push('<!--[-->');

							Sidebar.Content($$renderer, {
								children: ($$renderer) => {
									NavMain($$renderer, { items: navItems });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Sidebar.Footer) {
							$$renderer.push('<!--[-->');

							Sidebar.Footer($$renderer, {
								children: ($$renderer) => {
									NavUser($$renderer, {});
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
	});
}