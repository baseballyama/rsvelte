import * as $ from 'svelte/internal/server';
import * as Sidebar from '$lib/components/ui/sidebar';
import AppSidebar from '$lib/components/app-sidebar.svelte';
import { Globe, LayoutTemplate, Store, Library, Cuboid } from 'lucide-svelte';
import { page } from '$app/state';
import { check_session } from '$lib/pocketbase/user';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { current_user, set_current_user } from '$lib/pocketbase/user';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		onMount(async () => {
			if (!await check_session()) {
				await goto('/admin/auth');
			}
		});

		let { children } = $$props;

		const sidebar_menu = $.derived(() => {
			const pathname = page.url.pathname;
			const path = pathname.split('/').slice(0, 4).join('/');

			return ({
				'/admin/dashboard/sites': { title: 'Sites', icon: Globe },
				'/admin/dashboard/library': { title: 'Block Library', icon: Library },
				'/admin/dashboard/marketplace': {
					title: 'Marketplace',
					icon: Store,
					buttons: [
						{
							icon: LayoutTemplate,
							label: 'Starters',
							url: '/admin/dashboard/marketplace/starters',
							isActive: pathname === '/admin/dashboard/marketplace/starters'
						},

						{
							icon: Cuboid,
							label: 'Blocks',
							url: '/admin/dashboard/marketplace/blocks',
							isActive: pathname === '/admin/dashboard/marketplace/blocks'
						}
					]
				}
			})[path];
		});

		if (!$.store_get($$store_subs ??= {}, '$current_user', current_user)?.serverRole) {
			$$renderer.push(`<!--[0--><div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: white;">Forbidden</div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (Sidebar.Provider) {
				$$renderer.push('<!--[-->');

				Sidebar.Provider($$renderer, {
					children: ($$renderer) => {
						AppSidebar($$renderer, { sidebar_menu: sidebar_menu() });
						$$renderer.push(`<!----> `);

						if (Sidebar.Inset) {
							$$renderer.push('<!--[-->');

							Sidebar.Inset($$renderer, {
								children: ($$renderer) => {
									children?.($$renderer);
									$$renderer.push(`<!---->`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}