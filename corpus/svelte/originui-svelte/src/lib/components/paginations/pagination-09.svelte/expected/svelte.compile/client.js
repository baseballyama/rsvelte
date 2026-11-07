import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between gap-3"><p class="text-muted-foreground flex-1 text-sm whitespace-nowrap" aria-live="polite">Page <span class="text-foreground"> </span> of <span class="text-foreground"> </span></p> <div><!></div> <div class="flex flex-1 justify-end"><!></div></div>`);

export default function Pagination_09($$anchor, $$props) {
	$.push($$props, true);

	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		paginationItemsToDisplay = $.prop($$props, 'paginationItemsToDisplay', 3, 5),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	const pagination = usePagination({
		currentPage: currentPage(),
		paginationItemsToDisplay: paginationItemsToDisplay(),
		totalPages: totalPages()
	});

	const paginationItemsToDisplayOptions = ['10', '20', '50', '100'];
	let selectedPaginationItemsToDisplay = $.state($.proxy(paginationItemsToDisplayOptions[0]));
	var div = root_2();
	var p = $.child(div);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(p);

	var div_1 = $.sibling(p, 2);
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

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, page));
											$.append($$anchor, text_2);
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

	Select(node_6, {
		type: 'single',
		get value() {
			return $.get(selectedPaginationItemsToDisplay);
		},

		set value($$value) {
			$.set(selectedPaginationItemsToDisplay, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_1();
			var node_7 = $.first_child(fragment_13);

			SelectTrigger(node_7, {
				id: 'results-per-page',
				class: 'w-fit whitespace-nowrap',
				'aria-label': 'Results per page',
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = $.comment();
					var node_8 = $.first_child(fragment_14);

					{
						var consequent_2 = ($$anchor) => {
							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, `${$.get(selectedPaginationItemsToDisplay) ?? ''} / page`));
							$.append($$anchor, text_3);
						};

						var alternate = ($$anchor) => {
							var text_4 = $.text('Select number of results');

							$.append($$anchor, text_4);
						};

						$.if(node_8, ($$render) => {
							if ($.get(selectedPaginationItemsToDisplay)) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			SelectContent(node_9, {
				children: ($$anchor, $$slotProps) => {
					var fragment_16 = $.comment();
					var node_10 = $.first_child(fragment_16);

					$.each(node_10, 16, () => paginationItemsToDisplayOptions, (option) => option, ($$anchor, option) => {
						SelectItem($$anchor, {
							get value() {
								return option;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text();

								$.template_effect(() => $.set_text(text_5, `${option ?? ''} / page`));
								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_16);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, currentPage());
		$.set_text(text_1, totalPages());
	});

	$.append($$anchor, div);
	$.pop();
}