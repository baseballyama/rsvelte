import * as $ from 'svelte/internal/server';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-wrap items-center gap-2 md:flex-row">`);

	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Submit',
		children: ($$renderer) => {
			ArrowUpIcon($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}