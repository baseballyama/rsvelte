import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import ArrowRight from "@lucide/svelte/icons/arrow-right";

export default function Call_to_action_two($$renderer, $$props) {
	let {
		eyebrow = "Limited Time Offer",
		title = "Start Building Today",
		description = "Get 3 months free when you sign up for an annual plan. No credit card required to start.",
		ctaLabel = "Claim Your Offer",
		ctaHref = "#link"
	} = $$props;

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6">`);

	Card($$renderer, {
		variant: 'outline',
		class: 'p-8 md:p-12',
		children: ($$renderer) => {
			$$renderer.push(`<div class="mb-6 text-sm font-medium text-muted-foreground">${$.escape(eyebrow)}</div> <h2 class="font-serif text-3xl font-medium text-balance md:text-4xl">${$.escape(title)}</h2> <p class="mt-4 max-w-md text-balance text-muted-foreground">${$.escape(description)}</p> `);

			Button($$renderer, {
				href: ctaHref,
				class: 'mt-8 gap-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(ctaLabel)} `);
					ArrowRight($$renderer, { class: 'size-4' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></section>`);
}