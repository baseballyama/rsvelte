import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ArrowLeft from '@lucide/svelte/icons/arrow-left';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';

export default function Pagination_02($$renderer, $$props) {
	let { currentPage = 1, totalPages = 10 } = $$props;

	Pagination($$renderer, {
		children: ($$renderer) => {
			PaginationContent($$renderer, {
				class: 'w-full justify-between gap-3',
				children: ($$renderer) => {
					PaginationItem($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'ghost',
								class: 'group aria-disabled:pointer-events-none aria-disabled:opacity-50',
								'aria-disabled': currentPage === 1 ? true : undefined,
								role: currentPage === 1 ? 'link' : undefined,
								children: ($$renderer) => {
									ArrowLeft($$renderer, {
										class: '-ms-1 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5',
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
								variant: 'ghost',
								class: 'group aria-disabled:pointer-events-none aria-disabled:opacity-50',
								'aria-disabled': currentPage === totalPages ? true : undefined,
								role: currentPage === totalPages ? 'link' : undefined,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Next `);

									ArrowRight($$renderer, {
										class: 'ms-2 -me-1 opacity-60 transition-transform group-hover:translate-x-0.5',
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