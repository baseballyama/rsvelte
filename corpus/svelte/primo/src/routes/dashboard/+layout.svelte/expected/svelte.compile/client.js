import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from '$lib/components/ui/sidebar';
import AppSidebar from '$lib/components/app-sidebar.svelte';
import { Globe, LayoutTemplate, Store, Library, Cuboid } from 'lucide-svelte';
import { page } from '$app/state';
import { check_session } from '$lib/pocketbase/user';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { current_user, set_current_user } from '$lib/pocketbase/user';

var root = $.from_html(`<div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: white;">Forbidden</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	onMount(async () => {
		if (!await check_session()) {
			await goto('/admin/auth');
		}
	});

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

	$.user_effect(() => set_current_user());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
				Sidebar_Provider($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						AppSidebar(node_2, {
							get sidebar_menu() {
								return $.get(sidebar_menu);
							}
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
							Sidebar_Inset($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									$.snippet(node_4, () => $$props.children ?? $.noop);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (!$current_user()?.serverRole) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}