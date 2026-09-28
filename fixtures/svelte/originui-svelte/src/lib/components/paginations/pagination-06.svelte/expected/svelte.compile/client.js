import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePagination } from '$lib/hooks/use-pagination.svelte';

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNextButton,
	PaginationPrevButton
} from '$lib/components/ui/pagination';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Pagination_06($$anchor, $$props) {
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
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					PaginationItem(node, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => currentPage() === 1 ? undefined : `#/page/${currentPage() - 1}`);
								let $1 = $.derived(() => currentPage() === 1 ? true : undefined);
								let $2 = $.derived(() => currentPage() === 1 ? 'link' : undefined);

								PaginationPrevButton($$anchor, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									get href() {
										return $.get($0);
									},

									get 'aria-disabled'() {
										return $.get($1);
									},

									get role() {
										return $.get($2);
									}
								});
							}
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					{
						var consequent = ($$anchor) => {
							PaginationItem($$anchor, {
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
									let $0 = $.derived(() => page === currentPage());

									PaginationLink($$anchor, {
										get href() {
											return `#/page/${page ?? ''}`;
										},

										get isActive() {
											return $.get($0);
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
								children: ($$anchor, $$slotProps) => {
									PaginationEllipsis($$anchor, {});
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
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => currentPage() === totalPages() ? undefined : `#/page/${currentPage() + 1}`);
								let $1 = $.derived(() => currentPage() === totalPages() ? true : undefined);
								let $2 = $.derived(() => currentPage() === totalPages() ? 'link' : undefined);

								PaginationNextButton($$anchor, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									get href() {
										return $.get($0);
									},

									get 'aria-disabled'() {
										return $.get($1);
									},

									get role() {
										return $.get($2);
									}
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