import * as $ from 'svelte/internal/server';
import { usePagination } from '$lib/hooks/use-pagination.svelte';
import ChevronFirst from '@lucide/svelte/icons/chevron-first';
import ChevronLast from '@lucide/svelte/icons/chevron-last';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink
} from '$lib/components/ui/pagination';

export default function Pagination_07($$renderer, $$props) {
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
					children: ($$renderer) => {
						PaginationItem($$renderer, {
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									href: currentPage === 1 ? undefined : `#/page/${currentPage - 1}`,
									'aria-label': 'Go to first page',
									'aria-disabled': currentPage === 1 ? true : undefined,
									role: currentPage === 1 ? 'link' : undefined,
									children: ($$renderer) => {
										ChevronFirst($$renderer, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
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
								children: ($$renderer) => {
									PaginationEllipsis($$renderer, {});
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
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

						$$renderer.push(`<!----> `);

						PaginationItem($$renderer, {
							children: ($$renderer) => {
								PaginationLink($$renderer, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									href: currentPage === totalPages ? undefined : `#/page/${totalPages}`,
									'aria-label': 'Go to last page',
									'aria-disabled': currentPage === totalPages ? true : undefined,
									role: currentPage === totalPages ? 'link' : undefined,
									children: ($$renderer) => {
										ChevronLast($$renderer, { size: 16, 'aria-hidden': 'true' });
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