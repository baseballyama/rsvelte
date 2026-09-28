import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import { usePagination } from '$lib/hooks/use-pagination.svelte';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink
} from '$lib/components/ui/pagination';

import { cn } from '$lib/utils';

export default function Pagination_08($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			currentPage = 1,
			paginationItemsToDisplay = 5,
			totalPages = 10
		} = $$props;

		const pagination = usePagination({ currentPage, paginationItemsToDisplay, totalPages });

		Pagination($$renderer, {
			children: ($$renderer) => {
				PaginationContent($$renderer, {
					class: 'inline-flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/5 rtl:space-x-reverse',
					children: ($$renderer) => {
						PaginationItem($$renderer, {
							class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: cn(buttonVariants({ variant: 'outline' }), 'rounded-none shadow-none focus-visible:z-10 aria-disabled:pointer-events-none [&[aria-disabled]>svg]:opacity-50'),
									href: currentPage === 1 ? undefined : `#/page/${currentPage - 1}`,
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

						if (pagination.showLeftEllipsis) {
							$$renderer.push('<!--[0-->');

							PaginationItem($$renderer, {
								class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
								children: ($$renderer) => {
									PaginationEllipsis($$renderer, {});
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array = $.ensure_array_like(pagination.pages);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let page = each_array[$$index];

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationLink($$renderer, {
										class: cn(buttonVariants({ variant: 'outline' }), 'rounded-none shadow-none focus-visible:z-10', page === currentPage && 'bg-accent'),
										href: `#/page/${$.stringify(page)}`,
										isActive: page === currentPage,
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(page)}`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--> `);

						if (pagination.showRightEllipsis) {
							$$renderer.push('<!--[0-->');

							PaginationItem($$renderer, {
								class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
								children: ($$renderer) => {
									PaginationEllipsis($$renderer, {
										class: cn(buttonVariants({ variant: 'outline' }), 'pointer-events-none rounded-none shadow-none')
									});
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						PaginationItem($$renderer, {
							class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: cn(buttonVariants({ variant: 'outline' }), 'rounded-none shadow-none focus-visible:z-10 aria-disabled:pointer-events-none [&[aria-disabled]>svg]:opacity-50'),
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