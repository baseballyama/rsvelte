import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
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

export default function Pagination_10($$renderer, $$props) {
	let { currentPage = 1, totalPages = 10 } = $$props;
	const paginationItemsToDisplayOptions = [10, 20, 50, 100];
	let selectedPaginationItemsToDisplay = paginationItemsToDisplayOptions[0];

	function getValue() {
		return selectedPaginationItemsToDisplay.toString();
	}

	function setValue(newValue) {
		selectedPaginationItemsToDisplay = parseInt(newValue);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		var bind_get = getValue;
		var bind_set = setValue;

		$$renderer.push(`<div class="flex items-center justify-between gap-8"><div class="flex items-center gap-3">`);

		Label($$renderer, {
			for: 'rows-per-page',
			class: 'w-fit whitespace-nowrap',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Rows per page`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Select($$renderer, {
			get value() {
				return bind_get();
			},

			set value($$value) {
				bind_set($$value);
			},
			type: 'single',
			children: ($$renderer) => {
				SelectTrigger($$renderer, {
					id: 'rows-per-page',
					class: 'w-fit whitespace-nowrap',
					children: ($$renderer) => {
						if (selectedPaginationItemsToDisplay) {
							$$renderer.push(`<!--[0-->${$.escape(selectedPaginationItemsToDisplay)}`);
						} else {
							$$renderer.push(`<!--[-1-->Select number of results`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SelectContent($$renderer, {
					class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(paginationItemsToDisplayOptions);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];

							SelectItem($$renderer, {
								value: option.toString(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option)}`);
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

		$$renderer.push(`<!----></div> <div class="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap"><p class="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite"><span class="text-foreground">1-10</span> of <span class="text-foreground">100</span></p></div> <div>`);

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

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}