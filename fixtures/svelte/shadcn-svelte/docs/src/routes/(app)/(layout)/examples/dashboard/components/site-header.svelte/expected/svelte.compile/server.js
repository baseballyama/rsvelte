import * as $ from 'svelte/internal/server';
import CirclePlusFilledIcon from "@tabler/icons-svelte/icons/circle-plus-filled";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Site_header($$renderer) {
	$$renderer.push(`<header class="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/90 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"><div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6"><h1 class="text-base font-medium">Documents</h1> <div class="ms-auto flex items-center gap-2">`);

	Button($$renderer, {
		size: 'sm',
		class: 'hidden h-7 sm:flex',
		children: ($$renderer) => {
			CirclePlusFilledIcon($$renderer, {});
			$$renderer.push(`<!----> <span>Quick Create</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></header>`);
}