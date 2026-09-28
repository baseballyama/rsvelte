import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Pagination_08($$anchor, $$props) {
	$.push($$props, true);

	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		paginationItemsToDisplay = $.prop($$props, 'paginationItemsToDisplay', 3, 5),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	const pagination = usePagination({
		currentPage: currentPage(),
		paginationItemsToDisplay: paginationItemsToDisplay(),
		totalPages: totalPages()
	});

	Pagination($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				class: 'inline-flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/5 rtl:space-x-reverse',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					PaginationItem(node, {
						class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline' }), 'rounded-none shadow-none focus-visible:z-10 aria-disabled:pointer-events-none [&[aria-disabled]>svg]:opacity-50'));
								let $1 = $.derived(() => currentPage() === 1 ? undefined : `#/page/${currentPage() - 1}`);
								let $2 = $.derived(() => currentPage() === 1 ? true : undefined);
								let $3 = $.derived(() => currentPage() === 1 ? 'link' : undefined);

								PaginationLink($$anchor, {
									get class() {
										return $.get($0);
									},

									get href() {
										return $.get($1);
									},
									'aria-label': 'Go to previous page',
									get 'aria-disabled'() {
										return $.get($2);
									},

									get role() {
										return $.get($3);
									},

									children: ($$anchor, $$slotProps) => {
										ChevronLeft($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					{
						var consequent = ($$anchor) => {
							PaginationItem($$anchor, {
								class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
								children: ($$anchor, $$slotProps) => {
									PaginationEllipsis($$anchor, {});
								},
								$$slots: { default: true }
							});
						};

						$.if(node_1, ($$render) => {
							if (pagination.showLeftEllipsis) $$render(consequent);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					$.each(node_2, 16, () => pagination.pages, (page) => page, ($$anchor, page) => {
						PaginationItem($$anchor, {
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline' }), 'rounded-none shadow-none focus-visible:z-10', page === currentPage() && 'bg-accent'));
									let $1 = $.derived(() => page === currentPage());

									PaginationLink($$anchor, {
										get class() {
											return $.get($0);
										},

										get href() {
											return `#/page/${page ?? ''}`;
										},

										get isActive() {
											return $.get($1);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, page));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					{
						var consequent_1 = ($$anchor) => {
							PaginationItem($$anchor, {
								class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline' }), 'pointer-events-none rounded-none shadow-none'));

										PaginationEllipsis($$anchor, {
											get class() {
												return $.get($0);
											}
										});
									}
								},
								$$slots: { default: true }
							});
						};

						$.if(node_3, ($$render) => {
							if (pagination.showRightEllipsis) $$render(consequent_1);
						});
					}

					var node_4 = $.sibling(node_3, 2);

					PaginationItem(node_4, {
						class: '[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline' }), 'rounded-none shadow-none focus-visible:z-10 aria-disabled:pointer-events-none [&[aria-disabled]>svg]:opacity-50'));
								let $1 = $.derived(() => currentPage() === totalPages() ? undefined : `#/page/${currentPage() + 1}`);
								let $2 = $.derived(() => currentPage() === totalPages() ? true : undefined);
								let $3 = $.derived(() => currentPage() === totalPages() ? 'link' : undefined);

								PaginationLink($$anchor, {
									get class() {
										return $.get($0);
									},

									get href() {
										return $.get($1);
									},
									'aria-label': 'Go to next page',
									get 'aria-disabled'() {
										return $.get($2);
									},

									get role() {
										return $.get($3);
									},

									children: ($$anchor, $$slotProps) => {
										ChevronRight($$anchor, { size: 16, 'aria-hidden': 'true' });
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

	$.pop();
}