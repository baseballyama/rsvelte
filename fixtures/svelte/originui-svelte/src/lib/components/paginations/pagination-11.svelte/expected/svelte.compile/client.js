import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Pagination_11($$anchor, $$props) {
	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	const paginationItemsToDisplayOptions = Array.from({ length: totalPages() }, (_, i) => i + 1);
	let selectedPaginationItemsToDisplay = $.state($.proxy(String(paginationItemsToDisplayOptions[0])));

	Pagination($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					PaginationItem(node, {
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
									'aria-label': 'Go to first page',
									get 'aria-disabled'() {
										return $.get($1);
									},

									get role() {
										return $.get($2);
									},

									children: ($$anchor, $$slotProps) => {
										ChevronFirst($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

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

					PaginationItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							Select($$anchor, {
								type: 'single',
								get value() {
									return $.get(selectedPaginationItemsToDisplay);
								},

								set value($$value) {
									$.set(selectedPaginationItemsToDisplay, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_3 = $.first_child(fragment_8);

									SelectTrigger(node_3, {
										id: 'select-page',
										class: 'w-fit whitespace-nowrap',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = $.comment();
											var node_4 = $.first_child(fragment_9);

											{
												var consequent = ($$anchor) => {
													var text = $.text();

													$.template_effect(() => $.set_text(text, `Page ${$.get(selectedPaginationItemsToDisplay) ?? ''}`));
													$.append($$anchor, text);
												};

												var alternate = ($$anchor) => {
													var text_1 = $.text('Select page');

													$.append($$anchor, text_1);
												};

												$.if(node_4, ($$render) => {
													if ($.get(selectedPaginationItemsToDisplay)) $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_3, 2);

									SelectContent(node_5, {
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = $.comment();
											var node_6 = $.first_child(fragment_11);

											$.each(node_6, 16, () => Array.from({ length: totalPages() }, (_, i) => i + 1), (page) => page, ($$anchor, page) => {
												{
													let $0 = $.derived(() => String(page));

													SelectItem($$anchor, {
														get value() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, `Page ${page ?? ''}`));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												}
											});

											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_2, 2);

					PaginationItem(node_7, {
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

					var node_8 = $.sibling(node_7, 2);

					PaginationItem(node_8, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => currentPage() === totalPages() ? undefined : `#/page/${totalPages()}`);
								let $1 = $.derived(() => currentPage() === totalPages() ? true : undefined);
								let $2 = $.derived(() => currentPage() === totalPages() ? 'link' : undefined);

								PaginationLink($$anchor, {
									class: 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
									get href() {
										return $.get($0);
									},
									'aria-label': 'Go to last page',
									get 'aria-disabled'() {
										return $.get($1);
									},

									get role() {
										return $.get($2);
									},

									children: ($$anchor, $$slotProps) => {
										ChevronLast($$anchor, { size: 16, 'aria-hidden': 'true' });
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