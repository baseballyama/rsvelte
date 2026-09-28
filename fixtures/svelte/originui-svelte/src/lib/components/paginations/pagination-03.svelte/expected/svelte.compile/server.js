import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink
} from '$lib/components/ui/pagination';

import { cn } from '$lib/utils';

export default function Pagination_03($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { currentPage = 1, totalPages = 10 } = $$props;

		Pagination($$renderer, {
			children: ($$renderer) => {
				PaginationContent($$renderer, {
					class: 'w-full justify-between',
					children: ($$renderer) => {
						PaginationItem($$renderer, {
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: cn('aria-disabled:pointer-events-none aria-disabled:opacity-50', buttonVariants({ variant: 'outline' })),
									'aria-label': 'Go to previous page',
									'aria-disabled': currentPage === 1 ? true : undefined,
									role: currentPage === 1 ? 'link' : undefined,
									children: ($$renderer) => {
										ChevronLeft($$renderer, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<p class="text-muted-foreground text-sm" aria-live="polite">Page <span class="text-foreground">${$.escape(currentPage)}</span> of <span class="text-foreground">${$.escape(totalPages)}</span></p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: cn('aria-disabled:pointer-events-none aria-disabled:opacity-50', buttonVariants({ variant: 'outline' })),
									href: currentPage === totalPages ? undefined : `#/page/${currentPage + 1}`,
									'aria-label': 'Go to next page',
									'aria-disabled': currentPage === totalPages ? true : undefined,
									role: currentPage === totalPages ? 'link' : undefined,
									children: ($$renderer) => {
										ChevronRight($$renderer, { size: 16, 'aria-hidden': 'true' });
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
	});
}