import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import BookmarkIcon from '@lucide/svelte/icons/bookmark';
import HomeIcon from '@lucide/svelte/icons/home';
import { Filters } from '$lib/components/_extras/navbars';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

export default function Navbar_17_todo($$renderer) {
	$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4">`);

	Breadcrumb($$renderer, {
		children: ($$renderer) => {
			BreadcrumbList($$renderer, {
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									HomeIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span class="sr-only">Home</span>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					BreadcrumbSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbPage($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Reports`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex items-center gap-2">`);
	Filters($$renderer, {});
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'sm',
		variant: 'outline',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$renderer) => {
			BookmarkIcon($$renderer, {
				class: 'text-muted-foreground/80 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> <span class="max-sm:sr-only">Saved</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></header>`);
}