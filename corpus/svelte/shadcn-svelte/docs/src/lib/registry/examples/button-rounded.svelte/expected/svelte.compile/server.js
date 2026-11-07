import * as $ from 'svelte/internal/server';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_rounded($$renderer) {
	$$renderer.push(`<div class="flex flex-col gap-8">`);

	Button($$renderer, {
		variant: 'outline',
		size: 'icon',
		class: 'rounded-full',
		children: ($$renderer) => {
			ArrowUpIcon($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}