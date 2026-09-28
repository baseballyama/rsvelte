import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Site_header($$renderer) {
	$$renderer.push(`<header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"><div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">`);

	if (Sidebar.Trigger) {
		$$renderer.push('<!--[-->');
		Sidebar.Trigger($$renderer, { class: '-ms-1' });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	Separator($$renderer, {
		orientation: 'vertical',
		class: 'mx-2 data-[orientation=vertical]:h-4'
	});

	$$renderer.push(`<!----> <h1 class="text-base font-medium">Documents</h1> <div class="ms-auto flex items-center gap-2">`);

	Button($$renderer, {
		href: 'https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard',
		variant: 'ghost',
		size: 'sm',
		class: 'hidden sm:flex dark:text-foreground',
		target: '_blank',
		rel: 'noopener noreferrer',
		children: ($$renderer) => {
			$$renderer.push(`<!---->GitHub`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></header>`);
}