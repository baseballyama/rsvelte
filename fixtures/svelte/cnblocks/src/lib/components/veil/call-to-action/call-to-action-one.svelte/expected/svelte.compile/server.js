import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/veil/button";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

export default function Call_to_action_one($$renderer, $$props) {
	let {
		title = "Ready to Get Started?",
		description = "Join thousands of teams already using our platform to build better products faster.",
		primaryLabel = "Start Free Trial",
		primaryHref = "#link",
		secondaryLabel = "Talk to Sales",
		secondaryHref = "#link"
	} = $$props;

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><h2 class="font-serif text-4xl font-medium text-balance">${$.escape(title)}</h2> <p class="mx-auto mt-4 max-w-md text-balance text-muted-foreground">${$.escape(description)}</p> <div class="mt-6 flex flex-wrap justify-center gap-3">`);

	Button($$renderer, {
		href: primaryHref,
		class: 'pr-1.5',
		children: ($$renderer) => {
			$$renderer.push(`<span>${$.escape(primaryLabel)}</span> `);
			ChevronRight($$renderer, { class: 'opacity-50' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'secondary',
		href: secondaryHref,
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(secondaryLabel)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></section>`);
}