import * as $ from 'svelte/internal/server';
import Check from "@lucide/svelte/icons/check";
import Minus from "@lucide/svelte/icons/minus";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

export default function Comparator_three($$renderer) {
	const plans = [
		{
			name: "Starter",
			price: "$0",
			period: "/month",
			description: "For individuals and small projects",
			cta: "Get Started",
			features: {
				integrations: "3",
				apiCalls: "1,000/mo",
				support: "Community",
				analytics: false,
				webhooks: false,
				sso: false
			}
		},

		{
			name: "Pro",
			price: "$29",
			period: "/month",
			description: "For growing teams",
			cta: "Start Free Trial",
			highlighted: true,
			features: {
				integrations: "Unlimited",
				apiCalls: "100,000/mo",
				support: "Priority",
				analytics: true,
				webhooks: true,
				sso: false
			}
		},

		{
			name: "Enterprise",
			price: "Custom",
			period: "",
			description: "For large organizations",
			cta: "Contact Sales",
			features: {
				integrations: "Unlimited",
				apiCalls: "Unlimited",
				support: "Dedicated",
				analytics: true,
				webhooks: true,
				sso: true
			}
		}
	];

	const featureLabels = {
		integrations: "Integrations",
		apiCalls: "API Calls",
		support: "Support",
		analytics: "Analytics",
		webhooks: "Custom Webhooks",
		sso: "SSO / SAML"
	};

	const featureKeys = [
		"integrations",
		"apiCalls",
		"support",
		"analytics",
		"webhooks",
		"sso"
	];

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Choose Your Plan</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Start free and scale as you grow.</p></div> <div class="mt-12 space-y-4"><!--[-->`);

	const each_array = $.ensure_array_like(plans);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let plan = each_array[$$index_1];

		Card($$renderer, {
			variant: plan.highlighted ? "default" : "mixed",
			class: `p-6 ${plan.highlighted ? "ring-primary" : ""}`,
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col gap-6 @lg:flex-row @lg:items-start @lg:justify-between"><div class="@lg:max-w-xs"><h3 class="font-medium text-foreground">${$.escape(plan.name)}</h3> <p class="mt-1 text-sm text-muted-foreground">${$.escape(plan.description)}</p> <div class="mt-4"><span class="font-serif text-3xl font-medium">${$.escape(plan.price)}</span> `);

				if (plan.period) {
					$$renderer.push(`<!--[0--><span class="text-muted-foreground">${$.escape(plan.period)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				Button($$renderer, {
					href: '#link',
					variant: plan.highlighted ? "default" : "outline",
					size: 'sm',
					class: 'mt-4',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(plan.cta)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="w-full shrink-0 @lg:w-64"><!--[-->`);

				const each_array_1 = $.ensure_array_like(featureKeys);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let featureKey = each_array_1[$$index];
					const value = plan.features[featureKey];

					$$renderer.push(`<div class="flex items-center justify-between border-b py-3 text-sm last:border-b-0"><span class="text-muted-foreground">${$.escape(featureLabels[featureKey])}</span> `);

					if (typeof value === "boolean") {
						$$renderer.push('<!--[0-->');

						if (value) {
							$$renderer.push('<!--[0-->');
							Check($$renderer, { class: 'size-4 text-primary' });
						} else {
							$$renderer.push('<!--[-1-->');
							Minus($$renderer, { class: 'size-4 text-muted-foreground/50' });
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><span class="font-medium text-foreground">${$.escape(value)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></div></div></section>`);
}