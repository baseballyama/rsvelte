import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import { GithubIcon, GitlabIcon } from '$lib/icons';
import Account from './Account.svelte';

export default function Accounts($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const githubUser = $.store_get($$store_subs ??= {}, '$page', page).data.session?.githubUser;
		const gitlabUser = $.store_get($$store_subs ??= {}, '$page', page).data.session?.gitlabUser;

		$$renderer.push(`<ul class="accounts-wrapper svelte-sf1dmd">`);

		Account($$renderer, {
			title: 'GitHub',
			provider: 'github',
			user: githubUser,
			$$slots: {
				icon: ($$renderer) => {
					GithubIcon($$renderer, { slot: 'icon' });
				}
			}
		});

		$$renderer.push(`<!----> `);

		Account($$renderer, {
			title: 'GitLab',
			provider: 'gitlab',
			user: gitlabUser,
			$$slots: {
				icon: ($$renderer) => {
					GitlabIcon($$renderer, { slot: 'icon' });
				}
			}
		});

		$$renderer.push(`<!----></ul>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}