import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { paginationNav } from "./theme";
import PaginationButton from "./PaginationButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { setPaginationContext } from "$lib/context";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'currentPage',
	'totalPages',
	'visiblePages',
	'onPageChange',
	'prevContent',
	'nextContent',
	'prevClass',
	'nextClass',
	'layout',
	'nextLabel',
	'previousLabel',
	'ariaLabel',
	'size',
	'class',
	'classes',
	'spanClass',
	'tableDivClass'
]);

var root = $.from_html(`<div>Showing <span> </span> of <span> </span> Entries</div>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<nav><!> <ul><li><!></li> <!> <li><!></li></ul></nav>`);

export default function PaginationNav($$anchor, $$props) {
	$.push($$props, true);

	function paginationRange(start, end) {
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	let currentPage = $.prop($$props, 'currentPage', 3, 1),
		totalPages = $.prop($$props, 'totalPages', 3, 1),
		visiblePages = $.prop($$props, 'visiblePages', 3, 5 // New prop to control visible pages
		),
		layout = $.prop($$props, 'layout', 3, "pagination"),
		nextLabel = $.prop($$props, 'nextLabel', 3, "Next"),
		previousLabel = $.prop($$props, 'previousLabel', 3, "Previous"),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "Page navigation"),
		size = $.prop($$props, 'size', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"PaginationNav",
		untrack(() => ({
			prevClass: $$props.prevClass,
			nextClass: $$props.nextClass,
			spanClass: $$props.spanClass,
			tableDivClass: $$props.tableDivClass
		})),
		{
			prevClass: "prev",
			nextClass: "next",
			spanClass: "span",
			tableDivClass: "tableDiv"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		prev: $$props.prevClass,
		next: $$props.nextClass,
		span: $$props.spanClass,
		tableDiv: $$props.tableDivClass
	});

	const theme = $.derived(() => getTheme("paginationNav"));

	// Create context object
	const ctx = {
		get group() {
			return true;
		},

		get size() {
			return size();
		},

		get table() {
			return layout() === "table";
		},

		get activeClasses() {
			return $$props.classes?.active;
		}
	};

	// Set context during initialization
	setPaginationContext(ctx);

	// Calculate visible pages range using Svelte 5 derived values
	const halfVisiblePages = $.derived(() => Math.floor(visiblePages() / 2));

	const lastPage = $.derived(() => Math.min(
		Math.max(
			layout() === "pagination"
				? currentPage() + $.get(halfVisiblePages)
				: currentPage() + $.get(halfVisiblePages) * 2,
			visiblePages()
		),
		totalPages()
	));

	const firstPage = $.derived(() => Math.max(1, $.get(lastPage) - visiblePages() + 1));

	// Generate array of page numbers to display
	const pageNumbers = $.derived(() => paginationRange($.get(firstPage), $.get(lastPage)));

	// Navigation helper functions
	function goToNextPage() {
		$$props.onPageChange(Math.min(currentPage() + 1, totalPages()));
	}

	function goToPreviousPage() {
		$$props.onPageChange(Math.max(currentPage() - 1, 1));
	}

	const $$d = $.derived(() => paginationNav({ layout: layout() })),
		base = $.derived(() => $.get($$d).base),
		tableDiv = $.derived(() => $.get($$d).tableDiv),
		span = $.derived(() => $.get($$d).span),
		prev = $.derived(() => $.get($$d).prev),
		next = $.derived(() => $.get($$d).next);

	var nav = root_2();

	$.attribute_effect(nav, () => ({ 'aria-label': ariaLabel(), ...restProps }));

	var node = $.child(nav);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var span_1 = $.sibling($.child(div));
			var text = $.only_child(span_1, true);
			var span_2 = $.sibling(span_1, 2);
			var text_1 = $.only_child(span_2, true);

			$.next();
			$.reset(div);

			$.template_effect(
				($0, $1, $2) => {
					$.set_class(div, 1, $0);
					$.set_class(span_1, 1, $1);
					$.set_text(text, currentPage());
					$.set_class(span_2, 1, $2);
					$.set_text(text_1, totalPages());
				},
				[
					() => $.clsx($.get(tableDiv)({ class: clsx($.get(theme)?.tableDiv, $.get(styling).tableDiv) })),
					() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) })),
					() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) }))
				]
			);

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (layout() === "table") $$render(consequent);
		});
	}

	var ul = $.sibling(node, 2);
	var li = $.child(ul);

	$.attribute_effect(li, () => ({ ...restProps }));

	var node_1 = $.child(li);

	{
		let $0 = $.derived(() => currentPage() === 1);
		let $1 = $.derived(() => $.get(prev)({ class: clsx($.get(theme)?.prev, $.get(styling).prev) }));

		PaginationButton(node_1, {
			onclick: goToPreviousPage,
			get disabled() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_2 = $.first_child(fragment);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.snippet(node_3, () => $$props.prevContent);
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, previousLabel()));
						$.append($$anchor, text_2);
					};

					$.if(node_2, ($$render) => {
						if ($$props.prevContent) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(li);

	var node_4 = $.sibling(li, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			$.each(node_5, 16, () => $.get(pageNumbers), (page) => page, ($$anchor, page) => {
				var li_1 = root_1();
				var node_6 = $.child(li_1);

				{
					let $0 = $.derived(() => page === currentPage());

					PaginationButton(node_6, {
						get active() {
							return $.get($0);
						},
						onclick: () => $$props.onPageChange(page),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, page));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				}

				$.reset(li_1);
				$.template_effect(() => $.set_attribute(li_1, 'aria-current', page === currentPage() ? "page" : undefined));
				$.append($$anchor, li_1);
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_4, ($$render) => {
			if (layout() === "pagination" && $.get(pageNumbers).length > 0) $$render(consequent_2);
		});
	}

	var li_2 = $.sibling(node_4, 2);

	$.attribute_effect(li_2, () => ({ ...restProps }));

	var node_7 = $.child(li_2);

	{
		let $0 = $.derived(() => currentPage() === totalPages());
		let $1 = $.derived(() => $.get(next)({ class: clsx($.get(theme)?.next, $.get(styling).next) }));

		PaginationButton(node_7, {
			onclick: goToNextPage,
			get disabled() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_8 = $.first_child(fragment_5);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_6 = $.comment();
						var node_9 = $.first_child(fragment_6);

						$.snippet(node_9, () => $$props.nextContent);
						$.append($$anchor, fragment_6);
					};

					var alternate_1 = ($$anchor) => {
						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, nextLabel()));
						$.append($$anchor, text_4);
					};

					$.if(node_8, ($$render) => {
						if ($$props.nextContent) $$render(consequent_3); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	}

	$.reset(li_2);
	$.reset(ul);
	$.reset(nav);

	$.template_effect(($0) => $.set_class(ul, 1, $0), [
		() => $.clsx($.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }))
	]);

	$.append($$anchor, nav);
	$.pop();
}