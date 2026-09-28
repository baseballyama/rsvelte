import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';

var root = $.from_html(`<!> Previous`, 1);
var root_1 = $.from_html(`Next <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Pagination_01($$anchor, $$props) {
	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	Pagination($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				class: 'w-full justify-between gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node = $.first_child(fragment_2);

					PaginationItem(node, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => currentPage() === 1 ? true : undefined);
								let $1 = $.derived(() => currentPage() === 1 ? 'link' : undefined);
								let $2 = $.derived(() => currentPage() === 1 ? undefined : `#/page/${currentPage() - 1}`);

								Button($$anchor, {
									variant: 'outline',
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									get 'aria-disabled'() {
										return $.get($0);
									},

									get role() {
										return $.get($1);
									},

									get href() {
										return $.get($2);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_1 = $.first_child(fragment_4);

										ChevronLeft(node_1, {
											class: '-ms-1 me-2 opacity-60',
											size: 16,
											'aria-hidden': 'true'
										});

										$.next();
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node, 2);

					PaginationItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => currentPage() === totalPages() ? true : undefined);
								let $1 = $.derived(() => currentPage() === totalPages() ? 'link' : undefined);
								let $2 = $.derived(() => currentPage() === totalPages() ? undefined : `#/page/${currentPage() + 1}`);

								Button($$anchor, {
									variant: 'outline',
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									get 'aria-disabled'() {
										return $.get($0);
									},

									get role() {
										return $.get($1);
									},

									get href() {
										return $.get($2);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_6 = root_1();
										var node_3 = $.sibling($.first_child(fragment_6));

										ChevronRight(node_3, {
											class: 'ms-2 -me-1 opacity-60',
											size: 16,
											'aria-hidden': 'true'
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}