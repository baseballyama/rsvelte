import * as $ from 'svelte/internal/server';
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Check from "@lucide/svelte/icons/check";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { cn } from "$lib/utils";

export default function Pricing_three($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const plans = [
			{
				name: "Monthly",
				price: "$29",
				period: "/month",
				description: "Flexible month-to-month billing",
				features: [
					"All features included",
					"Cancel anytime",
					"No long-term commitment"
				]
			},

			{
				name: "Annual",
				price: "$19",
				period: "/month",
				description: "Save 35% with annual billing",
				features: [
					"All features included",
					"2 months free",
					"Priority onboarding"
				],
				highlighted: true,
				badge: "Best Value"
			}
		];

		$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">One Plan, Simple Pricing</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Everything you need to build powerful integrations. Choose your billing cycle.</p></div> <div class="mt-12 grid gap-6 @xl:grid-cols-2 @xl:gap-3"><!--[-->`);

		const each_array = $.ensure_array_like(plans);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let plan = each_array[$$index_1];

			Card($$renderer, {
				variant: plan.highlighted ? "default" : "mixed",
				class: cn("relative p-6", plan.highlighted && "ring-primary"),
				children: ($$renderer) => {
					$$renderer.push(`<div class="mb-6"><h3 class="font-medium text-foreground">${$.escape(plan.name)}</h3> <p class="mt-1 text-sm text-muted-foreground">${$.escape(plan.description)}</p></div> <div><span class="font-serif text-5xl font-medium">${$.escape(plan.price)}</span> <span class="text-muted-foreground">${$.escape(plan.period)}</span></div> <ul class="mt-6 space-y-3"><!--[-->`);

					const each_array_1 = $.ensure_array_like(plan.features);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let feature = each_array_1[$$index];

						$$renderer.push(`<li class="flex items-center gap-2 text-sm text-muted-foreground">`);
						Check($$renderer, { class: 'size-4 text-primary' });
						$$renderer.push(`<!----> ${$.escape(feature)}</li>`);
					}

					$$renderer.push(`<!--]--></ul> `);

					Button($$renderer, {
						href: '#link',
						variant: plan.highlighted ? "default" : "outline",
						class: 'mt-8 w-full gap-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Get Started `);
							ArrowRight($$renderer, { class: 'size-4' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> <p class="mt-8 text-center text-sm text-muted-foreground">All plans include a 14-day free trial. No credit card required.</p></div></section>`);
	});
}