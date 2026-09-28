import * as $ from 'svelte/internal/server';
import Primo from '$lib/builder/Primo.svelte';
import { check_session } from '$lib/pocketbase/user';
import { refresh_author_mode } from '$lib/pocketbase/author_mode';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Sites } from '$lib/pocketbase/collections';
import { current_user, set_current_user } from '$lib/pocketbase/user';
import { Loader } from 'lucide-svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		onMount(async () => {
			if (!await check_session()) {
				await goto('/admin/auth');

				return;
			}

			refresh_author_mode();
		});

		let { children } = $$props;
		const site_id = $.derived(() => page.params.site_id);
		const site = $.derived(() => site_id() ? Sites.one(site_id()) : null);

		if (site() === null) {
			$$renderer.push(`<!--[0--><div class="placeholder svelte-9j1gec">Site not found</div>`);
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
			$$renderer.push(`<!--[-1--><div class="placeholder svelte-9j1gec">`);
			Loader($$renderer, {});
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}