import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { HeaderAlert } from '$lib/layout';
import { hideBillingHeaderRoutes, teamStatusUpgrading } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';

export default function PaymentProcessing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$organization', organization)?.$id && $.store_get($$store_subs ??= {}, '$organization', organization)?.status === teamStatusUpgrading && !hideBillingHeaderRoutes.includes(page.url.pathname)) {
			$$renderer.push('<!--[0-->');

			HeaderAlert($$renderer, {
				title: 'Payment is processing',
				type: 'info',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Your plan will activate within a few minutes. You can keep using ${$.escape($.store_get($$store_subs ??= {}, '$organization', organization).name)} while we
        confirm the charge with your bank.`);
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