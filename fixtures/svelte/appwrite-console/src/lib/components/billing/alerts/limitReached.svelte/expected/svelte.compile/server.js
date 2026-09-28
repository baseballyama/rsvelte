import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Button } from '$lib/elements/forms';
import { HeaderAlert } from '$lib/layout';
import { hideBillingHeaderRoutes, readOnly, getChangePlanUrl } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';

export default function LimitReached($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$organization', organization)?.$id && !$.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanDetails.usage && $.store_get($$store_subs ??= {}, '$readOnly', readOnly) && !hideBillingHeaderRoutes.includes(page.url.pathname)) {
			$$renderer.push('<!--[0-->');

			HeaderAlert($$renderer, {
				type: 'error',
				title: `${$.store_get($$store_subs ??= {}, '$organization', organization).name} usage has reached the ${$.store_get($$store_subs ??= {}, '$organization', organization).billingPlanDetails.name} plan limit`,
				children: ($$renderer) => {
					{
						$$renderer.push(`Usage for the <b>${$.escape($.store_get($$store_subs ??= {}, '$organization', organization).name)}</b> organization has reached the limits of the ${$.escape($.store_get($$store_subs ??= {}, '$organization', organization).billingPlanDetails.name)}
            plan. Consider upgrading to increase your resource usage.`);
					}
				},

				$$slots: {
					default: true,
					buttons: ($$renderer) => {
						{
							if (!page.data.currentPlan?.usagePerProject) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									href: `${base}/organization-${$.store_get($$store_subs ??= {}, '$organization', organization).$id}/usage`,
									text: true,
									fullWidthMobile: true,
									children: ($$renderer) => {
										$$renderer.push(`<span class="text">View usage</span>`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							Button($$renderer, {
								href: getChangePlanUrl($.store_get($$store_subs ??= {}, '$organization', organization).$id),
								secondary: true,
								fullWidthMobile: true,
								children: ($$renderer) => {
									$$renderer.push(`<span class="text">Upgrade plan</span>`);
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