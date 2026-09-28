import * as $ from 'svelte/internal/server';
import Card from "$lib/components/ui/card/card.svelte";
import { cn } from "$lib/utils";

function cardDecorator($$renderer) {
	$$renderer.push(`<span class="absolute -top-px -left-px block size-2 border-primary" style="border-top-width: 2px; border-left-width: 2px;"></span> <span class="absolute -top-px -right-px block size-2 border-primary" style="border-top-width: 2px; border-right-width: 2px;"></span> <span class="absolute -bottom-px -left-px block size-2 border-primary" style="border-bottom-width: 2px; border-left-width: 2px;"></span> <span class="absolute -right-px -bottom-px block size-2 border-primary" style="border-bottom-width: 2px; border-right-width: 2px;"></span>`);
}

export default function Feature_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: _class = "" } = $$props;

		Card($$renderer, {
			class: cn("group relative rounded-none shadow-zinc-950/5", _class),
			children: ($$renderer) => {
				cardDecorator($$renderer);
				$$renderer.push(`<!----> `);
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}