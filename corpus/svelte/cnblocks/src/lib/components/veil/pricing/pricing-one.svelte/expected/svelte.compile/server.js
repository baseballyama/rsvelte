import * as $ from 'svelte/internal/server';
import Check from "@lucide/svelte/icons/check";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { cn } from "$lib/utils";

export default function Pricing_one($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const plans = [
			{
				name: "Starter",
				description: "Perfect for individuals and small projects.",
				price: "$0",
				period: "/month",
				features: [
					"Up to 3 integrations",
					"1,000 API calls/month",
					"Community support",
					"Basic analytics"
				],
				cta: "Get Started",
				highlighted: false
			},

			{
				name: "Pro",
				description: "For growing teams that need more power.",
				price: "$29",
				period: "/month",
				features: [
					"Unlimited integrations",
					"100,000 API calls/month",
					"Priority support",
					"Advanced analytics",
					"Custom webhooks",
					"Team collaboration"
				],
				cta: "Start Free Trial",
				highlighted: true
			},

			{
				name: "Enterprise",
				description: "For organizations with advanced needs.",
				price: "Custom",
				period: "",
				features: [
					"Everything in Pro",
					"Unlimited API calls",
					"Dedicated support",
					"SLA guarantee",
					"Custom contracts",
					"On-premise option"
				],
				cta: "Contact Sales",
				highlighted: false
			}
		];

		$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Simple, Transparent Pricing</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Choose the plan that fits your needs. All plans include a 14-day free trial.</p></div> <div class="mt-12 grid gap-3 @3xl:grid-cols-2"><!--[-->`);

		const each_array = $.ensure_array_like(plans);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let plan = each_array[$$index_1];

			Card($$renderer, {
				variant: plan.highlighted ? "default" : "mixed",
				class: cn("relative flex flex-col p-6 last:col-span-full", plan.highlighted && "ring-primary"),
				children: ($$renderer) => {
					$$renderer.push(`<div><h3 class="font-medium text-foreground">${$.escape(plan.name)}</h3> <p class="mt-1 text-sm text-muted-foreground">${$.escape(plan.description)}</p></div> <div class="mt-6"><span class="font-serif text-4xl font-medium">${$.escape(plan.price)}</span> <span class="text-muted-foreground">${$.escape(plan.period)}</span></div> <ul class="mt-6 flex-1 space-y-3"><!--[-->`);

					const each_array_1 = $.ensure_array_like(plan.features);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let feature = each_array_1[$$index];

						$$renderer.push(`<li class="flex items-start gap-2 text-sm text-muted-foreground">`);
						Check($$renderer, { class: 'mt-0.5 size-4 shrink-0 text-primary' });
						$$renderer.push(`<!----> ${$.escape(feature)}</li>`);
					}

					$$renderer.push(`<!--]--></ul> `);

					Button($$renderer, {
						href: '#link',
						variant: plan.highlighted ? "default" : "outline",
						class: 'mt-8 w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(plan.cta)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div></section>`);
	});
}