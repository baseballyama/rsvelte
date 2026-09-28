import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';

export default function Pagination_01($$renderer, $$props) {
	let { currentPage = 1, totalPages = 10 } = $$props;

	Pagination($$renderer, {
		children: ($$renderer) => {
			PaginationContent($$renderer, {
				class: 'w-full justify-between gap-3',
				children: ($$renderer) => {
					PaginationItem($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
								'aria-disabled': currentPage === 1 ? true : undefined,
								role: currentPage === 1 ? 'link' : undefined,
								href: currentPage === 1 ? undefined : `#/page/${currentPage - 1}`,
								children: ($$renderer) => {
									ChevronLeft($$renderer, {
										class: '-ms-1 me-2 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Previous`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
								'aria-disabled': currentPage === totalPages ? true : undefined,
								role: currentPage === totalPages ? 'link' : undefined,
								href: currentPage === totalPages ? undefined : `#/page/${currentPage + 1}`,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Next `);

									ChevronRight($$renderer, {
										class: 'ms-2 -me-1 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!---->`);
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