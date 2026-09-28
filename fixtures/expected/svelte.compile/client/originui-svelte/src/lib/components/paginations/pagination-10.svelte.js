import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between gap-8"><div class="flex items-center gap-3"><!> <!></div> <div class="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap"><p class="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite"><span class="text-foreground">1-10</span> of <span class="text-foreground">100</span></p></div> <div><!></div></div>`);

export default function Pagination_10($$anchor, $$props) {
	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	const paginationItemsToDisplayOptions = [10, 20, 50, 100];
	let selectedPaginationItemsToDisplay = $.state($.proxy(paginationItemsToDisplayOptions[0]));

	function getValue() {
		return $.get(selectedPaginationItemsToDisplay).toString();
	}

	function setValue(newValue) {
		$.set(selectedPaginationItemsToDisplay, parseInt(newValue), true);
	}

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		for: 'rows-per-page',
		class: 'w-fit whitespace-nowrap',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Rows per page');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);
	var bind_get = getValue;
	var bind_set = setValue;

	Select(node_1, {
		get value() {
			return bind_get();
		},

		set value($$value) {
			bind_set($$value);
		},
		type: 'single',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			SelectTrigger(node_2, {
				id: 'rows-per-page',
				class: 'w-fit whitespace-nowrap',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(selectedPaginationItemsToDisplay)));
							$.append($$anchor, text_1);
						};

						var alternate = ($$anchor) => {
							var text_2 = $.text('Select number of results');

							$.append($$anchor, text_2);
						};

						$.if(node_3, ($$render) => {
							if ($.get(selectedPaginationItemsToDisplay)) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			SelectContent(node_4, {
				class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					$.each(node_5, 16, () => paginationItemsToDisplayOptions, (option) => option, ($$anchor, option) => {
						{
							let $0 = $.derived(() => option.toString());

							SelectItem($$anchor, {
								get value() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, option));
									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var node_6 = $.child(div_2);

	Pagination(node_6, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_7 = $.first_child(fragment_7);

					PaginationItem(node_7, {
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

					var node_8 = $.sibling(node_7, 2);

					PaginationItem(node_8, {
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

					var node_9 = $.sibling(node_8, 2);

					PaginationItem(node_9, {
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

					var node_10 = $.sibling(node_9, 2);

					PaginationItem(node_10, {
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

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}