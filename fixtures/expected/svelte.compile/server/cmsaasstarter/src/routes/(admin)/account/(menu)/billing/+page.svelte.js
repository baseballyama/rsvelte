import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import SettingsModule from "../settings/settings_module.svelte";
import PricingModule from "../../../../(marketing)/pricing/pricing_module.svelte";
import { pricingPlans, defaultPlanId } from "../../../../(marketing)/pricing/pricing_plans";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let adminSection = getContext("adminSection");

		adminSection.set("billing");

		let { data } = $$props;
		let currentPlanId = $.derived(() => data.currentPlanId ?? defaultPlanId);
		let currentPlanName = $.derived(() => pricingPlans.find((x) => x.id === data.currentPlanId)?.name);

		$.head('9asqzq', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Billing</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-2">${$.escape(data.isActiveCustomer ? "Billing" : "Select a Plan")}</h1> <div>View our <a href="/pricing" target="_blank" class="link">pricing page</a> for details.</div> `);

		if (!data.isActiveCustomer) {
			$$renderer.push(`<!--[0--><div class="mt-8">`);

			PricingModule($$renderer, {
				currentPlanId: currentPlanId(),
				callToAction: 'Select Plan',
				center: false
			});

			$$renderer.push(`<!----></div> `);

			if (data.hasEverHadSubscription) {
				$$renderer.push(`<!--[0--><div class="mt-10"><a href="/account/billing/manage" class="link">View past invoices</a></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			SettingsModule($$renderer, {
				title: 'Subscription',
				editable: false,
				fields: [
					{
						id: "plan",
						label: "Current Plan",
						initialValue: currentPlanName() || ""
					}
				],
				editButtonTitle: 'Manage Subscription',
				editLink: '/account/billing/manage'
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}