import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '../ui/button.svelte';
import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between gap-3"><p class="text-muted-foreground grow text-sm" aria-live="polite">Page <span class="text-foreground"> </span> of <span class="text-foreground"> </span></p> <!></div>`);

export default function Pagination_05($$anchor, $$props) {
	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		totalPages = $.prop($$props, 'totalPages', 3, 10);

	var div = root_1();
	var p = $.child(div);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(p);

	var node = $.sibling(p, 2);

	Pagination(node, {
		class: 'w-auto',
		children: ($$anchor, $$slotProps) => {
			PaginationContent($$anchor, {
				class: 'gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					PaginationItem(node_1, {
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
										$.next();

										var text_2 = $.text('Previous');

										$.append($$anchor, text_2);
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

										var text_3 = $.text('Next');

										$.append($$anchor, text_3);
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

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, currentPage());
		$.set_text(text_1, totalPages());
	});

	$.append($$anchor, div);
}