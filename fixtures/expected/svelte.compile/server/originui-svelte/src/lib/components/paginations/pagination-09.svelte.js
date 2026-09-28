import * as $ from 'svelte/internal/server';
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

import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

export default function Pagination_09($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			currentPage = 1,
			paginationItemsToDisplay = 5,
			totalPages = 10
		} = $$props;

		const pagination = usePagination({ currentPage, paginationItemsToDisplay, totalPages });
		const paginationItemsToDisplayOptions = ['10', '20', '50', '100'];
		let selectedPaginationItemsToDisplay = paginationItemsToDisplayOptions[0];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex items-center justify-between gap-3"><p class="text-muted-foreground flex-1 text-sm whitespace-nowrap" aria-live="polite">Page <span class="text-foreground">${$.escape(currentPage)}</span> of <span class="text-foreground">${$.escape(totalPages)}</span></p> <div>`);

			Pagination($$renderer, {
				children: ($$renderer) => {
					PaginationContent($$renderer, {
						children: ($$renderer) => {
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

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-1 justify-end">`);

			Select($$renderer, {
				type: 'single',
				get value() {
					return selectedPaginationItemsToDisplay;
				},

				set value($$value) {
					selectedPaginationItemsToDisplay = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					SelectTrigger($$renderer, {
						id: 'results-per-page',
						class: 'w-fit whitespace-nowrap',
						'aria-label': 'Results per page',
						children: ($$renderer) => {
							if (selectedPaginationItemsToDisplay) {
								$$renderer.push(`<!--[0-->${$.escape(selectedPaginationItemsToDisplay)} / page`);
							} else {
								$$renderer.push(`<!--[-1-->Select number of results`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					SelectContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(paginationItemsToDisplayOptions);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let option = each_array_1[$$index_1];

								SelectItem($$renderer, {
									value: option,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(option)} / page`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}