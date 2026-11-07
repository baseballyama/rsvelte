import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { HeaderAlert } from '$lib/layout';
import { hideBillingHeaderRoutes } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';

export default function MarkedForDeletion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$organization', organization)?.markedForDeletion && !hideBillingHeaderRoutes.includes(page.url.pathname)) {
			$$renderer.push('<!--[0-->');

			HeaderAlert($$renderer, {
				title: 'Organization flagged for deletion',
				children: ($$renderer) => {
					{
						$$renderer.push(`All existing projects in the ${$.escape($.store_get($$store_subs ??= {}, '$organization', organization).name)} organization have been paused. This organization
            will be deleted once your upcoming invoice is processed successfully.`);
					}
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}