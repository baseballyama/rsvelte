import * as $ from 'svelte/internal/server';
import Button from '$lib/elements/forms/button.svelte';
import { canWriteKeys } from '$lib/stores/roles';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { base } from '$app/paths';
import { page } from '$app/state';

export default function Action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$canWriteKeys', canWriteKeys)) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				href: `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys/create`,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Create API key`);
				},

				$$slots: {
					default: true,
					start: ($$renderer) => {
						Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
					}
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}