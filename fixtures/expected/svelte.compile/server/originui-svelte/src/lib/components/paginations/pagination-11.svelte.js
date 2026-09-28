import * as $ from 'svelte/internal/server';
import ChevronFirst from '@lucide/svelte/icons/chevron-first';
import ChevronLast from '@lucide/svelte/icons/chevron-last';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink
} from '$lib/components/ui/pagination';

import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

export default function Pagination_11($$renderer, $$props) {
	let { currentPage = 1, totalPages = 10 } = $$props;
	const paginationItemsToDisplayOptions = Array.from({ length: totalPages }, (_, i) => i + 1);
	let selectedPaginationItemsToDisplay = String(paginationItemsToDisplayOptions[0]);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
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

						PaginationItem($$renderer, {
							children: ($$renderer) => {
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
											id: 'select-page',
											class: 'w-fit whitespace-nowrap',
											children: ($$renderer) => {
												if (selectedPaginationItemsToDisplay) {
													$$renderer.push(`<!--[0-->Page ${$.escape(selectedPaginationItemsToDisplay)}`);
												} else {
													$$renderer.push(`<!--[-1-->Select page`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SelectContent($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let page = each_array[$$index];

													SelectItem($$renderer, {
														value: String(page),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Page ${$.escape(page)}`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}