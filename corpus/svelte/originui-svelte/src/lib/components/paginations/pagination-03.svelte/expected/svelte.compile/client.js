import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink
} from '$lib/components/ui/pagination';

import { cn } from '$lib/utils';

var root = $.from_html(`<p class="text-muted-foreground text-sm" aria-live="polite">Page <span class="text-foreground"> </span> of <span class="text-foreground"> </span></p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Pagination_03($$anchor, $$props) {
	$.push($$props, true);

	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	Pagination($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				class: 'w-full justify-between',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					PaginationItem(node, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => cn('aria-disabled:pointer-events-none aria-disabled:opacity-50', buttonVariants({ variant: 'outline' })));
								let $1 = $.derived(() => currentPage() === 1 ? true : undefined);
								let $2 = $.derived(() => currentPage() === 1 ? 'link' : undefined);

								PaginationLink($$anchor, {
									get class() {
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

					var node_1 = $.sibling(node, 2);

					PaginationItem(node_1, {
						children: ($$anchor, $$slotProps) => {
							var p = root();
							var span = $.sibling($.child(p));
							var text = $.only_child(span, true);
							var span_1 = $.sibling(span, 2);
							var text_1 = $.only_child(span_1, true);

							$.reset(p);

							$.template_effect(() => {
								$.set_text(text, currentPage());
								$.set_text(text_1, totalPages());
							});

							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					PaginationItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => cn('aria-disabled:pointer-events-none aria-disabled:opacity-50', buttonVariants({ variant: 'outline' })));
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