import * as $ from 'svelte/internal/server';
import Check from "@lucide/svelte/icons/check";
import Minus from "@lucide/svelte/icons/minus";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

export default function Comparator_one($$renderer) {
	const planKeys = ["basic", "pro", "team"];

	const plans = [
		{
			name: "Basic",
			price: "$9",
			period: "/month",
			cta: "Get Started",
			highlighted: false
		},

		{
			name: "Pro",
			price: "$29",
			period: "/month",
			cta: "Start Free Trial",
			highlighted: true
		},

		{
			name: "Team",
			price: "$79",
			period: "/month",
			cta: "Start Free Trial",
			highlighted: false
		}
	];

	const features = [
		{
			name: "Integrations",
			basic: "5",
			pro: "Unlimited",
			team: "Unlimited"
		},

		{
			name: "API Calls",
			basic: "10K/mo",
			pro: "100K/mo",
			team: "1M/mo"
		},

		{
			name: "Team Members",
			basic: "1",
			pro: "5",
			team: "Unlimited"
		},

		{
			name: "Support",
			basic: "Email",
			pro: "Priority",
			team: "Dedicated"
		},
		{ name: "Analytics", basic: true, pro: true, team: true },
		{ name: "Custom Webhooks", basic: false, pro: true, team: true },
		{ name: "SSO", basic: false, pro: false, team: true },
		{ name: "Audit Logs", basic: false, pro: false, team: true }
	];

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-3xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Compare Plans</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">Find the perfect plan for your team's needs.</p></div> `);

	Card($$renderer, {
		variant: 'outline',
		class: 'mt-12 overflow-auto *:min-w-xl',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-4 border-b"><div class="p-4"></div> <!--[-->`);

			const each_array = $.ensure_array_like(plans);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let plan = each_array[$$index];

				$$renderer.push(`<div${$.attr_class(`border-l p-4 text-center ${plan.highlighted ? "bg-primary/5" : ""}`)}><p class="font-medium text-foreground">${$.escape(plan.name)}</p> <p class="mt-1"><span class="font-serif text-2xl font-medium">${$.escape(plan.price)}</span> <span class="text-sm text-muted-foreground">${$.escape(plan.period)}</span></p></div>`);
			}

			$$renderer.push(`<!--]--></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(features);

			for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
				let feature = each_array_1[$$index_2];

				$$renderer.push(`<div class="grid grid-cols-4 border-b last:border-b-0"><div class="p-4 text-sm text-muted-foreground">${$.escape(feature.name)}</div> <!--[-->`);

				const each_array_2 = $.ensure_array_like(planKeys);

				for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
					let planKey = each_array_2[idx];
					const value = feature[planKey];

					$$renderer.push(`<div${$.attr_class(`flex items-center justify-center border-l p-4 text-sm ${idx === 1 ? "bg-primary/5" : ""}`)}>`);

					if (typeof value === "boolean") {
						$$renderer.push('<!--[0-->');

						if (value) {
							$$renderer.push('<!--[0-->');
							Check($$renderer, { class: 'size-4 text-primary' });
						} else {
							$$renderer.push('<!--[-1-->');
							Minus($$renderer, { class: 'size-4 text-muted-foreground' });
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><span class="text-foreground">${$.escape(value)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--> <div class="grid grid-cols-4 border-t"><div class="p-4"></div> <!--[-->`);

			const each_array_3 = $.ensure_array_like(plans);

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let plan = each_array_3[$$index_3];

				$$renderer.push(`<div${$.attr_class(`border-l p-4 ${plan.highlighted ? "bg-primary/5" : ""}`)}>`);

				Button($$renderer, {
					href: '#link',
					variant: plan.highlighted ? "default" : "outline",
					size: 'sm',
					class: 'w-full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(plan.cta)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></section>`);
}