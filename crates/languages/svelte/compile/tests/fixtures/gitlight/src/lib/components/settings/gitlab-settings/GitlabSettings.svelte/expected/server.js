import * as $ from 'svelte/internal/server';
import { Button, Switch } from '$lib/components';
import { ExternalLinkIcon } from '$lib/icons';
import { settings } from '$lib/stores';
import GitlabRepos from './GitlabRepos.svelte';

export default function GitlabSettings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h3>GitLight settings</h3> `);

			Switch($$renderer, {
				label: 'Show only notifications in which you are involved',
				get active() {
					return $.store_get($$store_subs ??= {}, '$settings', settings).gitlabOnlyInvolved;
				},

				set active($$value) {
					$.store_mutate($$store_subs ??= {}, '$settings', settings, $.store_get($$store_subs ??= {}, '$settings', settings).gitlabOnlyInvolved = $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <span></span> <h3>Review applications</h3> <p class="text svelte-dljcew">You can review GitLight access <a href="https://gitlab.com/oauth/applications" target="_blank" class="svelte-dljcew">here</a>. More documentation:</p> <div class="button-container svelte-dljcew">`);

			Button($$renderer, {
				href: 'https://docs.gitlab.com/ee/integration/oauth_provider.html',
				external: true,
				small: true,
				children: ($$renderer) => {
					ExternalLinkIcon($$renderer, {});
					$$renderer.push(`<!----> GitLab documentation`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <span></span> <h3>Repositories</h3> `);
			GitlabRepos($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}