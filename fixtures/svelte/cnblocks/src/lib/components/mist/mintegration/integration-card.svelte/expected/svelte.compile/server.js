import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import Card from "$lib/components/ui/card/card.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

export default function Integration_card($$renderer, $$props) {
	let { children, title, description } = $$props;

	Card($$renderer, {
		variant: 'soft',
		class: 'p-6',
		children: ($$renderer) => {
			$$renderer.push(`<div class="relative"><div class="*:size-10">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div> <div class="mt-6 space-y-1.5"><h3 class="text-lg font-semibold">${$.escape(title)}</h3> <p class="line-clamp-2 text-muted-foreground">${$.escape(description)}</p></div></div>`);
		},
		$$slots: { default: true }
	});
}