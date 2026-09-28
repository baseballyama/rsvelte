import * as $ from 'svelte/internal/server';
import Button from '../ui/button.svelte';
import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';

export default function Pagination_05($$renderer, $$props) {
	let { currentPage = 1, totalPages = 10 } = $$props;

	$$renderer.push(`<div class="flex items-center justify-between gap-3"><p class="text-muted-foreground grow text-sm" aria-live="polite">Page <span class="text-foreground">${$.escape(currentPage)}</span> of <span class="text-foreground">${$.escape(totalPages)}</span></p> `);

	Pagination($$renderer, {
		class: 'w-auto',
		children: ($$renderer) => {
			PaginationContent($$renderer, {
				class: 'gap-3',
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
									$$renderer.push(`<!---->Previous`);
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
									$$renderer.push(`<!---->Next`);
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

	$$renderer.push(`<!----></div>`);
}