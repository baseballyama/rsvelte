import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';
import themeOptions from 'virtual:sveltepress/theme-default';
import Expansion from './Expansion.svelte';
import TocClose from './icons/TocClose.svelte';
import TocMenu from './icons/TocMenu.svelte';
import { navCollapsed } from './layout';
import Logo from './Logo.svelte';
import NavItem from './NavItem.svelte';

export default function NavbarMobile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function toggleNav() {
			$.store_set(navCollapsed, !$.store_get($$store_subs ??= {}, '$navCollapsed', navCollapsed));
		}

		$$renderer.push(`<div class="nav-trigger svelte-1axsvz0" role="menu" tabindex="0">`);

		if ($.store_get($$store_subs ??= {}, '$navCollapsed', navCollapsed)) {
			$$renderer.push('<!--[0-->');
			TocMenu($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
			TocClose($$renderer, {});
		}

		$$renderer.push(`<!--]--></div> `);

		if (!$.store_get($$store_subs ??= {}, '$navCollapsed', navCollapsed)) {
			$$renderer.push(`<!--[0--><nav class="navbar-mobile svelte-1axsvz0" aria-label="Menu">`);
			Logo($$renderer, {});
			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(themeOptions.navbar);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let navItem = each_array[$$index_1];

				if (navItem.items) {
					$$renderer.push('<!--[0-->');

					{
						function customTitle($$renderer) {
							$$renderer.push(`<div>`);

							if (navItem.icon) {
								$$renderer.push(`<!--[0--><div class="text-6">${$.html(navItem.icon)}</div>`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(navItem.title)}`);
							}

							$$renderer.push(`<!--]--></div>`);
						}

						Expansion($$renderer, {
							title: navItem.title,
							showIcon: false,
							customTitle,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(navItem.items);

								for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
									let subItem = each_array_1[$$index];

									NavItem($$renderer, $.spread_props([subItem]));
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { customTitle: true, default: true }
						});
					}
				} else {
					$$renderer.push('<!--[-1-->');
					NavItem($$renderer, $.spread_props([navItem]));
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></nav>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}