import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';
import Backdrop from './Backdrop.svelte';
import Close from './icons/Close.svelte';
import { resolvedSidebar, resolveSidebar, sidebarCollapsed } from './layout';
import Logo from './Logo.svelte';
import SidebarGroup from './SidebarGroup.svelte';

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const routeId = $.derived(() => page.route.id);
		const isHome = $.derived(() => routeId() === '/');

		afterNavigate(() => {
			resolveSidebar(routeId());
		});

		function handleClose() {
			$.store_set(sidebarCollapsed, true);
		}

		$$renderer.push(`<aside${$.attr_class('theme-default-sidebar svelte-1bf6b9s', void 0, {
			'collapsed': $.store_get($$store_subs ??= {}, '$sidebarCollapsed', sidebarCollapsed),
			'is-home': isHome()
		})}><div class="sidebar-logo svelte-1bf6b9s">`);

		Logo($$renderer, {});
		$$renderer.push(`<!----> <div class="close svelte-1bf6b9s" role="button" tabindex="0">`);
		Close($$renderer, {});
		$$renderer.push(`<!----></div></div> <!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$resolvedSidebar', resolvedSidebar));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let sidebarItem = each_array[$$index];
			const hasItems = Array.isArray(sidebarItem.items);

			SidebarGroup($$renderer, $.spread_props([hasItems ? sidebarItem : { title: '', items: [sidebarItem] }]));
		}

		$$renderer.push(`<!--]--></aside> `);

		Backdrop($$renderer, {
			show: !$.store_get($$store_subs ??= {}, '$sidebarCollapsed', sidebarCollapsed)
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}