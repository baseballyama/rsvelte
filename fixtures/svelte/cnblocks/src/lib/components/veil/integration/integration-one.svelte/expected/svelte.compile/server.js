import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/veil/button";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import IntegrationIllustration from "./integration-illustration.svelte";

export default function Integration_one($$renderer) {
	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6">`);
	IntegrationIllustration($$renderer, {});
	$$renderer.push(`<!----> <div class="mx-auto mt-12 max-w-md text-center text-balance"><h2 class="font-serif text-4xl font-medium">Connect Your Favorite Tools</h2> <p class="mt-4 mb-6 text-muted-foreground">Seamlessly integrate with the services you already use. Set up in minutes, not days.</p> `);

	Button($$renderer, {
		variant: 'secondary',
		size: 'sm',
		class: 'gap-1 pr-1.5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Learn more `);
			ChevronRight($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></section>`);
}