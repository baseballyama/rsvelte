import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { HeaderAlert } from '$lib/layout';
import { impersonatedResourceUrl } from '$lib/appwrite/impersonation';
import { actionRequiredInvoices, hideBillingHeaderRoutes } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import { getApiEndpoint } from '$lib/stores/sdk';

export default function PaymentAuthRequired($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const endpoint = getApiEndpoint();

		function invoiceUrl(invoiceId) {
			return $.store_get($$store_subs ??= {}, '$impersonatedResourceUrl', impersonatedResourceUrl)(`${endpoint}/organizations/${$.store_get($$store_subs ??= {}, '$organization', organization).$id}/invoices/${invoiceId}/view`);
		}

		if ($.store_get($$store_subs ??= {}, '$actionRequiredInvoices', actionRequiredInvoices) && $.store_get($$store_subs ??= {}, '$actionRequiredInvoices', actionRequiredInvoices)?.invoices?.length && !hideBillingHeaderRoutes.includes(page.url.pathname)) {
			$$renderer.push('<!--[0-->');

			HeaderAlert($$renderer, {
				title: 'Authorization required',
				type: 'error',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Please authorize your upcoming payment for ${$.escape($.store_get($$store_subs ??= {}, '$organization', organization).name)}. Your bank requires this
        security measure to proceed with payment.`);
				},

				$$slots: {
					default: true,
					buttons: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								href: invoiceUrl($.store_get($$store_subs ??= {}, '$actionRequiredInvoices', actionRequiredInvoices).invoices[0].$id),
								children: ($$renderer) => {
									$$renderer.push(`<!---->View invoice`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								secondary: true,
								href: `${base}/organization-${$.store_get($$store_subs ??= {}, '$organization', organization).$id}/billing?type=confirmation&invoice=${$.store_get($$store_subs ??= {}, '$actionRequiredInvoices', actionRequiredInvoices).invoices[0].$id}`,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Authorize payment`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
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