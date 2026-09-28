import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { HeaderAlert } from '$lib/layout';
import { impersonatedResourceUrl } from '$lib/appwrite/impersonation';
import { actionRequiredInvoices, hideBillingHeaderRoutes } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import { getApiEndpoint } from '$lib/stores/sdk';

var root = $.from_html(`<!> <!>`, 1);

export default function PaymentAuthRequired($$anchor, $$props) {
	$.push($$props, true);

	const $impersonatedResourceUrl = () => $.store_get(impersonatedResourceUrl, '$impersonatedResourceUrl', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $actionRequiredInvoices = () => $.store_get(actionRequiredInvoices, '$actionRequiredInvoices', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const endpoint = getApiEndpoint();

	function invoiceUrl(invoiceId) {
		return $impersonatedResourceUrl()(`${endpoint}/organizations/${$organization().$id}/invoices/${invoiceId}/view`);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HeaderAlert($$anchor, {
				title: 'Authorization required',
				type: 'error',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Please authorize your upcoming payment for ${$organization().name ?? ''}. Your bank requires this
        security measure to proceed with payment.`));

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					buttons: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_1 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => invoiceUrl($actionRequiredInvoices().invoices[0].$id));

							Button(node_1, {
								text: true,
								get href() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('View invoice');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						}

						var node_2 = $.sibling(node_1, 2);

						{
							let $0 = $.derived(() => `${base}/organization-${$organization().$id}/billing?type=confirmation&invoice=${$actionRequiredInvoices().invoices[0].$id}`);

							Button(node_2, {
								secondary: true,
								get href() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Authorize payment');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						}

						$.append($$anchor, fragment_3);
					}
				}
			});
		};

		var d = $.derived(() => $actionRequiredInvoices() && $actionRequiredInvoices()?.invoices?.length && !hideBillingHeaderRoutes.includes(page.url.pathname));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}