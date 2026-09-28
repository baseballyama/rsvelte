import * as $ from 'svelte/internal/server';
import Check from "@lucide/svelte/icons/check";
import Minus from "@lucide/svelte/icons/minus";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

export default function Comparator_two($$renderer) {
	const features = [
		{ name: "Integrations", free: "5", pro: "Unlimited" },
		{ name: "API Calls", free: "10K/mo", pro: "500K/mo" },
		{ name: "Team Members", free: "2", pro: "20" },
		{ name: "Support", free: "Email", pro: "Priority" },
		{ name: "Analytics Dashboard", free: false, pro: true },
		{ name: "Custom Webhooks", free: false, pro: true },
		{ name: "Advanced Security", free: false, pro: true },
		{ name: "API Access", free: false, pro: true }
	];

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">Free vs Pro</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">See what you get with each plan.</p></div> `);

	Card($$renderer, {
		variant: 'outline',
		class: 'mt-12 overflow-auto @max-md:*:min-w-md',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-3"><div class="p-4"></div> <div class="min-w-32 border-l p-4 text-center"><p class="font-medium text-foreground">Free</p> <p class="font-serif text-2xl font-medium">$0</p></div> <div class="min-w-32 border-l bg-primary/5 p-4 text-center"><p class="font-medium text-foreground">Pro</p> <p class="font-serif text-2xl font-medium">$29</p></div></div> <!--[-->`);

			const each_array = $.ensure_array_like(features);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let feature = each_array[$$index];

				$$renderer.push(`<div class="grid grid-cols-3 border-t"><div class="p-4 text-sm text-muted-foreground">${$.escape(feature.name)}</div> <div class="flex min-w-32 items-center justify-center border-l p-4 text-sm">`);

				if (typeof feature.free === "boolean") {
					$$renderer.push('<!--[0-->');

					if (feature.free) {
						$$renderer.push('<!--[0-->');
						Check($$renderer, { class: 'size-4 text-primary' });
					} else {
						$$renderer.push('<!--[-1-->');
						Minus($$renderer, { class: 'size-4 text-muted-foreground/50' });
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><span class="text-foreground">${$.escape(feature.free)}</span>`);
				}

				$$renderer.push(`<!--]--></div> <div class="flex min-w-32 items-center justify-center border-l bg-primary/5 p-4 text-sm">`);

				if (typeof feature.pro === "boolean") {
					$$renderer.push('<!--[0-->');

					if (feature.pro) {
						$$renderer.push('<!--[0-->');
						Check($$renderer, { class: 'size-4 text-primary' });
					} else {
						$$renderer.push('<!--[-1-->');
						Minus($$renderer, { class: 'size-4 text-muted-foreground/50' });
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><span class="font-medium text-foreground">${$.escape(feature.pro)}</span>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--> <div class="grid grid-cols-3 border-t"><div class="p-4"></div> <div class="min-w-32 border-l p-4">`);

			Button($$renderer, {
				href: '#link',
				variant: 'outline',
				size: 'sm',
				class: 'w-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get Started`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="min-w-32 border-l bg-primary/5 p-4">`);

			Button($$renderer, {
				href: '#link',
				size: 'sm',
				class: 'w-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Upgrade`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></section>`);
}