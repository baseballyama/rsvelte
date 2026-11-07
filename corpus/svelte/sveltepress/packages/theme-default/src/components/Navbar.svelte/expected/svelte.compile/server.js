import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onMount } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Discord from './icons/Discord.svelte';
import Github from './icons/Github.svelte';
import { scrollDirection } from './layout';
import Logo from './Logo.svelte';
import MobileSubNav from './MobileSubNav.svelte';
import NavbarMobile from './NavbarMobile.svelte';
import NavItem from './NavItem.svelte';
import ToggleDark from './ToggleDark.svelte';

export default function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const routeId = $.derived(() => page.route.id);
		const isHome = $.derived(() => routeId() === '/');
		const hasError = $.derived(() => page.error);
		let docsearchComponent = void 0;
		let searchComponent = void 0;

		onMount(async () => {
			// Load custom search component if it's a string path
			if (themeOptions.search && typeof themeOptions.search === 'string') {
				try {
					searchComponent = (await import(/* @vite-ignore */ themeOptions.search)).default;
				} catch(e) {
					console.error('[sveltepress] Failed to load custom search component:', e);
				}
			}

			// Load docsearch if no custom search is provided
			if (themeOptions.docsearch && !themeOptions.search) {
				try {
					docsearchComponent = (await import('@sveltepress/docsearch/Search.svelte')).default;
				} catch(e) {
					console.error('[sveltepress] Failed to load docsearch component:', e);
				}
			}
		});

		$$renderer.push(`<header${$.attr_class('header svelte-1mx54u2', void 0, {
			'hidden-in-mobile': $.store_get($$store_subs ??= {}, '$scrollDirection', scrollDirection) === 'down'
		})}><div class="header-inner svelte-1mx54u2"><div class="left svelte-1mx54u2">`);

		NavbarMobile($$renderer, {});
		$$renderer.push(`<!----> <div${$.attr_class('logo-container svelte-1mx54u2', void 0, { 'desktop-visible': hasError() || isHome() })}>`);
		Logo($$renderer, {});
		$$renderer.push(`<!----></div></div> `);

		if (searchComponent || themeOptions.search && typeof themeOptions.search !== 'string') {
			$$renderer.push(`<!--[0--><div${$.attr_class('doc-search svelte-1mx54u2', void 0, { 'is-home': isHome(), 'move': !isHome() && !hasError() })}>`);

			if (searchComponent || themeOptions.search) {
				$$renderer.push('<!--[-->');
				(searchComponent || themeOptions.search)($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		} else if (themeOptions.docsearch && docsearchComponent) {
			$$renderer.push(`<!--[1--><div${$.attr_class('doc-search svelte-1mx54u2', void 0, { 'is-home': isHome(), 'move': !isHome() && !hasError() })}>`);

			if (docsearchComponent) {
				$$renderer.push('<!--[-->');
				docsearchComponent($$renderer, $.spread_props([themeOptions.docsearch]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <nav class="nav-links svelte-1mx54u2" aria-label="Menu"><div class="navbar-pc svelte-1mx54u2"><div class="sm:flex none"><!--[-->`);

		const each_array = $.ensure_array_like(themeOptions.navbar);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let navItem = each_array[$$index];

			NavItem($$renderer, $.spread_props([navItem]));
		}

		$$renderer.push(`<!--]--></div> `);

		if (themeOptions.github) {
			$$renderer.push('<!--[0-->');

			NavItem($$renderer, {
				to: themeOptions.github,
				external: true,
				icon: true,
				builtInIcon: true,
				title: 'Github',
				children: ($$renderer) => {
					Github($$renderer, {});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (themeOptions.discord) {
			$$renderer.push('<!--[0-->');

			NavItem($$renderer, {
				to: themeOptions.discord,
				external: true,
				icon: true,
				builtInIcon: true,
				title: 'Discord',
				children: ($$renderer) => {
					Discord($$renderer, {});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		ToggleDark($$renderer, {});
		$$renderer.push(`<!----></div></nav></div> `);

		if (!isHome()) {
			$$renderer.push('<!--[0-->');
			MobileSubNav($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></header>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}