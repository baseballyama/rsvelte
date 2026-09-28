import * as $ from 'svelte/internal/server';
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { cn } from "$lib/utils";

export default function Pricing_two($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tiers = [
			{
				name: "Hobby",
				description: "For personal projects",
				price: "$0",
				period: "/month",
				limit: "1,000 requests/month"
			},

			{
				name: "Pro",
				description: "For professional use",
				price: "$20",
				period: "/month",
				limit: "50,000 requests/month",
				highlighted: true
			},

			{
				name: "Scale",
				description: "For high-volume apps",
				price: "$100",
				period: "/month",
				limit: "500,000 requests/month"
			},

			{
				name: "Enterprise",
				description: "For large organizations",
				price: "Custom",
				period: "",
				limit: "Unlimited requests"
			}
		];

		$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Usage-Based Pricing</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Pay only for what you use. All plans include the same features.</p></div> <div class="mt-12 space-y-3"><!--[-->`);

		const each_array = $.ensure_array_like(tiers);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tier = each_array[$$index];

			Card($$renderer, {
				variant: 'outline',
				class: cn("flex flex-col gap-4 p-4 @2xl:flex-row @2xl:items-center @2xl:justify-between", tier.highlighted && "ring-primary"),
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-2 @2xl:flex-row @2xl:items-center @2xl:gap-6"><div class="shrink-0 @2xl:w-44"><h3 class="font-medium text-foreground">${$.escape(tier.name)}</h3> <p class="text-sm text-muted-foreground">${$.escape(tier.description)}</p></div> <div class="@2xl:border-l @2xl:pl-6"><p class="text-sm text-muted-foreground">${$.escape(tier.limit)}</p></div></div> <div class="flex flex-col gap-4 @2xl:flex-row @2xl:items-center"><div class="@2xl:text-right"><span class="font-serif text-2xl font-medium">${$.escape(tier.price)}</span> `);

					if (tier.period) {
						$$renderer.push(`<!--[0--><span class="text-sm text-muted-foreground">${$.escape(tier.period)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					Button($$renderer, {
						href: '#link',
						variant: tier.highlighted ? "default" : "outline",
						size: 'sm',
						class: 'gap-1',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(tier.price === "Custom" ? "Contact Us" : "Get Started")} `);
							ArrowRight($$renderer, { class: 'size-3.5' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> <div class="mt-8 rounded-xl bg-muted p-6 text-center"><p class="font-medium text-foreground">Need more requests?</p> <p class="mt-1 text-sm text-muted-foreground">Additional requests are billed at $0.001 per request after your plan limit.</p></div></div></section>`);
	});
}