import * as $ from 'svelte/internal/server';
import Primo from '$lib/builder/Primo.svelte';
import { check_session } from '$lib/pocketbase/user';
import { refresh_author_mode } from '$lib/pocketbase/author_mode';
import { self } from '$lib/pocketbase/managers';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Sites } from '$lib/pocketbase/collections';
import CreateSite from '$lib/components/CreateSite.svelte';
import { is_host_assigned, site_editor_url } from '$lib/site_host';
import { current_user, set_current_user } from '$lib/pocketbase/user';
import { Loader } from 'lucide-svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const host = $.derived(() => page.url.host);
		const is_localhost = $.derived(() => host() === 'localhost:3000' || host() === '127.0.0.1:3000' || host().startsWith('localhost:') || host().startsWith('127.0.0.1:') || host().includes('.localhost:'));

		// Track if we've done the initial check
		let initial_check_done = false;

		let should_create_site = false;

		onMount(async () => {
			if (!await check_session()) {
				await goto('/admin/auth');

				return;
			}

			// Refresh author_mode on every load — needed because reloads on
			// /admin/site skip the auth layout's dev-auth handshake.
			refresh_author_mode();

			// On localhost root, check if we need to redirect to first available site
			if (is_localhost()) {
				try {
					// Direct API call to get all sites - this ensures we have real data
					const response = await self.instance?.collection('sites').getList(1, 1);

					if (response && response.items.length > 0) {
						const first_site = response.items[0];

						// Check if current host doesn't match any site
						const host_match = await self.instance?.collection('sites').getFirstListItem(`host = "${host()}"`).catch(() => null);

						if (!host_match && first_site.host) {
							// Redirect to the first site's editor. Assigned sites live at
							// their own vhost (//host/admin/site); unassigned sites
							// (host === id) have no reachable vhost and must open by id at
							// /admin/sites/{id} — otherwise the id gets used as a hostname
							// and DNS fails. site_editor_url handles both cases.
							window.location.href = site_editor_url(first_site);

							return;
						}
					} else {
						// No sites exist, show create screen
						should_create_site = true;
					}
				} catch {
					// If API fails, fall through to normal flow
				}
			}

			initial_check_done = true;
		});

		// First try to find site by exact host match
		const sites_by_host = $.derived(() => Sites.list({ filter: { host: host() } }));

		const site = $.derived(() => sites_by_host()?.[0]);

		// This host-based route serves a site whose `host` matches the current
		// domain. On a multi-site instance the current host often matches no site
		// (e.g. the bare instance URL, or an unassigned site whose host is its id
		// sentinel) — in that case there's nothing to edit here, so send the user
		// to the dashboard, which lists every site by id. `sites_by_host ===
		// undefined` means the list is still loading — wait for it before deciding,
		// so a brief pre-load gap doesn't bounce us to the dashboard when a site
		// does match.
		let creating_site = false;

		if (creating_site && $.store_get($$store_subs ??= {}, '$current_user', current_user)) {
			$$renderer.push('<!--[0-->');

			CreateSite($$renderer, {
				oncreated: (created) => {
					// Hard-navigate to the new site's admin. An assigned site lives at
					// its own vhost (redirect there); an unassigned site (host === id)
					// has no vhost, so open it by id. Hard nav (not goto) sidesteps the
					// stale Sites.list() cache that would otherwise re-trigger the gate.
					if (created && is_host_assigned(created)) {
						const protocol = page.url.protocol || 'http:';

						window.location.href = `${protocol}//${created.host}/admin/site`;
					} else if (created) {
						window.location.href = `/admin/sites/${created.id}`;
					}
				}
			});
		} else if (site() && $.store_get($$store_subs ??= {}, '$current_user', current_user)) {
			$$renderer.push('<!--[1-->');

			Primo($$renderer, {
				site: site(),
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push(`<!--[-1--><div class="placeholder svelte-1nt95nb">`);
			Loader($$renderer, {});
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}