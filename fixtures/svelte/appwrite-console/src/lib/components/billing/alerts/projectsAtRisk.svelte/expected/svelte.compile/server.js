import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { diffDays, toLocaleDate } from '$lib/helpers/date';
import { HeaderAlert } from '$lib/layout';
import { failedInvoice, hideBillingHeaderRoutes } from '$lib/stores/billing';

export default function ProjectsAtRisk($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$failedInvoice', failedInvoice) && !hideBillingHeaderRoutes.includes(page.url.pathname)) {
			$$renderer.push('<!--[0-->');

			const daysPassed = diffDays(new Date($.store_get($$store_subs ??= {}, '$failedInvoice', failedInvoice).dueAt), new Date());

			HeaderAlert($$renderer, {
				title: 'Your projects are at risk',
				children: ($$renderer) => {
					{
						if (daysPassed > 30) {
							$$renderer.push(`<!--[0-->Your scheduled payment on <b>${$.escape(toLocaleDate($.store_get($$store_subs ??= {}, '$failedInvoice', failedInvoice)?.dueAt))}</b> failed. To resume
                write access of your organization, please update your billing details.`);
						} else {
							$$renderer.push(`<!--[-1-->Your scheduled payment on <b>${$.escape(toLocaleDate($.store_get($$store_subs ??= {}, '$failedInvoice', failedInvoice)?.dueAt))}</b> failed. Access
                to paid projects within this organization will be disabled if no action is taken within
                30 days.`);
						}

						$$renderer.push(`<!--]-->`);
					}
				},

				$$slots: {
					default: true,
					buttons: ($$renderer) => {
						{
							Button($$renderer, {
								href: `${base}/organization-${$.store_get($$store_subs ??= {}, '$failedInvoice', failedInvoice)?.teamId}/billing#paymentMethods`,
								secondary: true,
								fullWidthMobile: true,
								children: ($$renderer) => {
									$$renderer.push(`<span class="text">Update billing details</span>`);
								},
								$$slots: { default: true }
							});
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