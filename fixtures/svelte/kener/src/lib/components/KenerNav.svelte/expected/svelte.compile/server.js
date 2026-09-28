import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
import * as Dropdown from "$lib/components/ui/dropdown-menu/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import trackEvent from "$lib/beacon";
import MenuIcon from "@lucide/svelte/icons/menu";

export default function KenerNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = page;
		const navItems = data.navItems || [];
		const { siteName, logo, globalPageVisibilitySettings } = data;

		const brandPath = $.derived(() => {
			if (globalPageVisibilitySettings?.forceExclusivity) {
				const currentPagePath = page.params?.page_path?.trim();

				return currentPagePath ? `/${currentPagePath}` : "/";
			}

			return "/";
		});

		function trackBrandClick() {
			trackEvent("nav_brand_clicked", { name: siteName });
		}

		function trackNavClick(item) {
			trackEvent("nav_link_clicked", { name: item.name, external: item.url.startsWith("http") });
		}

		$$renderer.push(`<div class="fixed inset-x-0 top-0 z-10 py-2"><div class="mx-auto max-w-5xl px-4"><div class="bg-background/80 dark:bg-background/70 flex items-center justify-between rounded-3xl border p-1 backdrop-blur-md"><a${$.attr('href', clientResolver(resolve, brandPath()))}${$.attr_class(`${$.stringify(navigationMenuTriggerStyle())} hover:border-border border border-transparent bg-transparent text-xs hover:bg-transparent`)} style="border-radius: var(--radius-3xl)">`);

		if (logo) {
			$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, logo))}${$.attr('alt', siteName)} class="mr-2 h-6 w-6 rounded-full object-cover"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> ${$.escape(siteName)}</a> `);

		if (NavigationMenu.Root) {
			$$renderer.push('<!--[-->');

			NavigationMenu.Root($$renderer, {
				class: 'hidden sm:block',
				children: ($$renderer) => {
					if (NavigationMenu.List) {
						$$renderer.push('<!--[-->');

						NavigationMenu.List($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(navItems);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									if (NavigationMenu.Item) {
										$$renderer.push('<!--[-->');

										NavigationMenu.Item($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer) {
														$$renderer.push(`<a data-sveltekit-preload-data="off"${$.attr('href', clientResolver(resolve, item.url))}${$.attr_class(`${$.stringify(navigationMenuTriggerStyle())} hover:border-border border border-transparent bg-transparent text-xs hover:bg-transparent`)}${$.attr('target', item.url.startsWith("http") ? "_blank" : undefined)}${$.attr('rel', item.url.startsWith("http") ? "noopener noreferrer" : undefined)} style="border-radius: var(--radius-3xl)">`);

														if (item.iconURL) {
															$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, item.iconURL))}${$.attr('alt', item.name)} class="mr-2 h-4 w-4 object-cover"/>`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape(item.name)}</a>`);
													}

													if (NavigationMenu.Link) {
														$$renderer.push('<!--[-->');
														NavigationMenu.Link($$renderer, { child, $$slots: { child: true } });
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

		$$renderer.push(` `);

		if (navItems.length > 0) {
			$$renderer.push('<!--[0-->');

			if (Dropdown.Root) {
				$$renderer.push('<!--[-->');

				Dropdown.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<button${$.attributes({
									...props,
									type: 'button',
									class: `${$.stringify(navigationMenuTriggerStyle())} hover:border-border border border-transparent bg-transparent text-xs hover:bg-transparent sm:hidden`,
									style: 'border-radius: var(--radius-3xl)',
									'aria-label': 'Open navigation menu'
								})}>`);

								MenuIcon($$renderer, { class: 'h-4 w-4' });
								$$renderer.push(`<!----></button>`);
							}

							if (Dropdown.Trigger) {
								$$renderer.push('<!--[-->');
								Dropdown.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Dropdown.Content) {
							$$renderer.push('<!--[-->');

							Dropdown.Content($$renderer, {
								align: 'end',
								class: 'w-56 rounded-3xl p-2',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(navItems);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let item = each_array_1[$$index_1];

										Button($$renderer, {
											variant: 'ghost',
											size: 'sm',
											href: clientResolver(resolve, item.url),
											class: 'w-full justify-start rounded-full text-xs',
											target: item.url.startsWith("http") ? "_blank" : undefined,
											rel: item.url.startsWith("http") ? "noopener noreferrer" : undefined,
											onclick: () => trackNavClick(item),
											children: ($$renderer) => {
												if (item.iconURL) {
													$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, item.iconURL))}${$.attr('alt', item.name)} class="mr-2 h-4 w-4 object-cover"/>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> ${$.escape(item.name)}`);
											},
											$$slots: { default: true }
										});
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

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}