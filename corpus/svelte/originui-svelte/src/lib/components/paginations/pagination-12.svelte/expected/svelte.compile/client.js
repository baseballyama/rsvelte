import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
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

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between gap-4"><div><!></div> <div class="flex items-center gap-3"><!> <!></div></div>`);

export default function Pagination_12($$anchor, $$props) {
	$.push($$props, true);

	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		paginationItemsToDisplay = $.prop($$props, 'paginationItemsToDisplay', 3, 5),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	const pagination = usePagination({
		currentPage: currentPage(),
		paginationItemsToDisplay: paginationItemsToDisplay(),
		totalPages: totalPages()
	});

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Pagination(node, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					PaginationItem(node_1, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => currentPage() === 1 ? undefined : `#/page/${currentPage() - 1}`);
								let $1 = $.derived(() => currentPage() === 1 ? true : undefined);
								let $2 = $.derived(() => currentPage() === 1 ? 'link' : undefined);

								PaginationLink($$anchor, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									get href() {
										return $.get($0);
									},
									'aria-label': 'Go to previous page',
									get 'aria-disabled'() {
										return $.get($1);
									},

									get role() {
										return $.get($2);
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

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent = ($$anchor) => {
							PaginationItem($$anchor, {
								children: ($$anchor, $$slotProps) => {
									PaginationEllipsis($$anchor, {});
								},
								$$slots: { default: true }
							});
						};

						$.if(node_2, ($$render) => {
							if (pagination.showLeftEllipsis) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_2, 2);

					$.each(node_3, 16, () => pagination.pages, (page) => page, ($$anchor, page) => {
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

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent_1 = ($$anchor) => {
							PaginationItem($$anchor, {
								children: ($$anchor, $$slotProps) => {
									PaginationEllipsis($$anchor, {});
								},
								$$slots: { default: true }
							});
						};

						$.if(node_4, ($$render) => {
							if (pagination.showRightEllipsis) $$render(consequent_1);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					PaginationItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => currentPage() === totalPages() ? undefined : `#/page/${currentPage() + 1}`);
								let $1 = $.derived(() => currentPage() === totalPages() ? true : undefined);
								let $2 = $.derived(() => currentPage() === totalPages() ? 'link' : undefined);

								PaginationLink($$anchor, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									get href() {
										return $.get($0);
									},
									'aria-label': 'Go to next page',
									get 'aria-disabled'() {
										return $.get($1);
									},

									get role() {
										return $.get($2);
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

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_6 = $.child(div_2);

	Label(node_6, {
		for: 'pagination-input',
		class: 'whitespace-nowrap',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Go to page');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	{
		let $0 = $.derived(() => String(currentPage()));

		Input(node_7, {
			id: 'pagination-input',
			type: 'text',
			class: 'w-14',
			get value() {
				return $.get($0);
			}
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}