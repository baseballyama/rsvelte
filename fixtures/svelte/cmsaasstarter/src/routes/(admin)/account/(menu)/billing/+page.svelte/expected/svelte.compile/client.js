import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import SettingsModule from "../settings/settings_module.svelte";
import PricingModule from "../../../../(marketing)/pricing/pricing_module.svelte";
import { pricingPlans, defaultPlanId } from "../../../../(marketing)/pricing/pricing_plans";

var root = $.from_html(`<div class="mt-10"><a href="/account/billing/manage" class="link">View past invoices</a></div>`);
var root_1 = $.from_html(`<div class="mt-8"><!></div> <!>`, 1);
var root_2 = $.from_html(`<h1 class="text-2xl font-bold mb-2"> </h1> <div>View our <a href="/pricing" target="_blank" class="link">pricing page</a> for details.</div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let adminSection = getContext("adminSection");

	adminSection.set("billing");

	let currentPlanId = $.derived(() => $$props.data.currentPlanId ?? defaultPlanId);
	let currentPlanName = $.derived(() => pricingPlans.find((x) => x.id === $$props.data.currentPlanId)?.name);
	var fragment = root_2();

	$.head('9asqzq', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Billing';
		});
	});

	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 4);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			PricingModule(node_1, {
				get currentPlanId() {
					return $.get(currentPlanId);
				},
				callToAction: 'Select Plan',
				center: false
			});

			$.reset(div);

			var node_2 = $.sibling(div, 2);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.data.hasEverHadSubscription) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => [
					{
						id: "plan",
						label: "Current Plan",
						initialValue: $.get(currentPlanName) || ""
					}
				]);

				SettingsModule($$anchor, {
					title: 'Subscription',
					editable: false,
					get fields() {
						return $.get($0);
					},
					editButtonTitle: 'Manage Subscription',
					editLink: '/account/billing/manage'
				});
			}
		};

		$.if(node, ($$render) => {
			if (!$$props.data.isActiveCustomer) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.template_effect(() => $.set_text(text, $$props.data.isActiveCustomer ? "Billing" : "Select a Plan"));
	$.append($$anchor, fragment);
	$.pop();
}