import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import Card from "$lib/components/ui/card/card.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

export default function Integration_card($$renderer, $$props) {
	let {
		children,
		title,
		description,
		link = "https://github.com/SikandarJODD/cnblocks"
	} = $$props;

	Card($$renderer, {
		class: 'p-6',
		children: ($$renderer) => {
			$$renderer.push(`<div class="relative"><div class="*:size-10">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div> <div class="space-y-2 py-6"><h3 class="text-base font-medium">${$.escape(title)}</h3> <p class="line-clamp-2 text-sm text-muted-foreground">${$.escape(description)}</p></div> <div class="flex gap-3 border-t border-dashed pt-6">`);

			Button($$renderer, {
				variant: 'secondary',
				size: 'sm',
				class: 'gap-1 pr-2 shadow-none',
				href: link,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Learn More `);
					ChevronRight($$renderer, { class: 'ml-0 size-3.5! opacity-50' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}