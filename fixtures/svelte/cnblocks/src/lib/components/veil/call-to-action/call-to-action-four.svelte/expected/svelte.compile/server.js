import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Check from "@lucide/svelte/icons/check";

export default function Call_to_action_four($$renderer, $$props) {
	let {
		title = "Transform Your Workflow",
		description = "Experience the power of seamless integrations and watch your productivity soar.",
		benefits = [
			"14-day free trial",
			"No credit card required",
			"Cancel anytime",
			"24/7 support"
		],
		price = "$0",
		priceSuffix = "/month",
		priceNote = "Free forever for individuals",
		ctaLabel = "Get Started Free",
		ctaHref = "#link"
	} = $$props;

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6">`);

	Card($$renderer, {
		variant: 'outline',
		class: 'grid gap-8 p-6 md:p-8 @xl:grid-cols-2',
		children: ($$renderer) => {
			$$renderer.push(`<div><h2 class="font-serif text-3xl font-medium text-balance">${$.escape(title)}</h2> <p class="mt-3 text-balance text-muted-foreground">${$.escape(description)}</p> <ul class="mt-6 space-y-2"><!--[-->`);

			const each_array = $.ensure_array_like(benefits);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let benefit = each_array[index];

				$$renderer.push(`<li class="flex items-center gap-2 text-sm text-muted-foreground">`);
				Check($$renderer, { class: 'size-4 text-primary' });
				$$renderer.push(`<!----> ${$.escape(benefit)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div> <div class="flex flex-col justify-center rounded-xl border bg-muted/50 p-6"><p class="text-sm text-muted-foreground">Starting at</p> <p class="mt-1 font-serif text-4xl font-medium">${$.escape(price)}<span class="text-lg font-normal text-muted-foreground">${$.escape(priceSuffix)}</span></p> <p class="mt-1 text-sm text-muted-foreground">${$.escape(priceNote)}</p> `);

			Button($$renderer, {
				href: ctaHref,
				class: 'mt-6 gap-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(ctaLabel)} `);
					ArrowRight($$renderer, { class: 'size-4' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></section>`);
}