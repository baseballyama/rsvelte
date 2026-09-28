import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="placeholder svelte-1nt95nb"><!></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const host = $.derived(() => page.url.host);
	const is_localhost = $.derived(() => $.get(host) === 'localhost:3000' || $.get(host) === '127.0.0.1:3000' || $.get(host).startsWith('localhost:') || $.get(host).startsWith('127.0.0.1:') || $.get(host).includes('.localhost:'));

	// Track if we've done the initial check
	let initial_check_done = $.state(false);

	let should_create_site = $.state(false);

	onMount(async () => {
		if (!await check_session()) {
			await goto('/admin/auth');

			return;
		}

		// Refresh author_mode on every load — needed because reloads on
		// /admin/site skip the auth layout's dev-auth handshake.
		refresh_author_mode();

		// On localhost root, check if we need to redirect to first available site
		if ($.get(is_localhost)) {
			try {
				// Direct API call to get all sites - this ensures we have real data
				const response = await self.instance?.collection('sites').getList(1, 1);

				if (response && response.items.length > 0) {
					const first_site = response.items[0];

					// Check if current host doesn't match any site
					const host_match = await self.instance?.collection('sites').getFirstListItem(`host = "${$.get(host)}"`).catch(() => null);

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
					$.set(should_create_site, true);
				}
			} catch {
				// If API fails, fall through to normal flow
			}
		}

		$.set(initial_check_done, true);
	});

	// First try to find site by exact host match
	const sites_by_host = $.derived(() => Sites.list({ filter: { host: $.get(host) } }));

	const site = $.derived(() => $.get(sites_by_host)?.[0]);

	// This host-based route serves a site whose `host` matches the current
	// domain. On a multi-site instance the current host often matches no site
	// (e.g. the bare instance URL, or an unassigned site whose host is its id
	// sentinel) — in that case there's nothing to edit here, so send the user
	// to the dashboard, which lists every site by id. `sites_by_host ===
	// undefined` means the list is still loading — wait for it before deciding,
	// so a brief pre-load gap doesn't bounce us to the dashboard when a site
	// does match.
	let creating_site = $.state(false);

	$.user_effect(() => {
		const list_loaded = $.get(sites_by_host) !== undefined;

		if ($.get(initial_check_done) && list_loaded && !$.get(site) && !$.get(is_localhost) && self.instance?.authStore.isValid) {
			goto('/admin/dashboard', { replaceState: true });
		} else if ($.get(site)) {
			$.set(creating_site, false);
		}

		if ($.get(should_create_site) && !$.get(creating_site) && !$.get(site)) {
			$.set(creating_site, true);
		}
	});

	$.user_effect(() => set_current_user($.get(site) || undefined));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			CreateSite($$anchor, {
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
		};

		var consequent_1 = ($$anchor) => {
			Primo($$anchor, {
				get site() {
					return $.get(site);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_1 = $.first_child(fragment_3);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			var div = root();
			var node_2 = $.child(div);

			Loader(node_2, {});
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(creating_site) && $current_user()) $$render(consequent); else if ($.get(site) && $current_user()) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}