import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { paginationNav } from "./theme";
import PaginationButton from "./PaginationButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { setPaginationContext } from "$lib/context";
import { untrack } from "svelte";

export default function PaginationNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function paginationRange(start, end) {
			return Array.from({ length: end - start + 1 }, (_, i) => start + i);
		}

		let {
			currentPage = 1,
			totalPages = 1,
			visiblePages = 5, // New prop to control visible pages
			onPageChange,
			prevContent,
			nextContent,
			prevClass,
			nextClass,
			layout = "pagination",
			nextLabel = "Next",
			previousLabel = "Previous",
			ariaLabel = "Page navigation",
			size = "default",
			class: className,
			classes,
			spanClass,
			tableDivClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("PaginationNav", untrack(() => ({ prevClass, nextClass, spanClass, tableDivClass })), {
			prevClass: "prev",
			nextClass: "next",
			spanClass: "span",
			tableDivClass: "tableDiv"
		});

		const styling = $.derived(() => classes ?? {
			prev: prevClass,
			next: nextClass,
			span: spanClass,
			tableDiv: tableDivClass
		});

		const theme = $.derived(() => getTheme("paginationNav"));

		// Create context object
		const ctx = {
			get group() {
				return true;
			},

			get size() {
				return size;
			},

			get table() {
				return layout === "table";
			},

			get activeClasses() {
				return classes?.active;
			}
		};

		// Set context during initialization
		setPaginationContext(ctx);

		// Calculate visible pages range using Svelte 5 derived values
		const halfVisiblePages = $.derived(() => Math.floor(visiblePages / 2));

		const lastPage = $.derived(() => Math.min(
			Math.max(
				layout === "pagination"
					? currentPage + halfVisiblePages()
					: currentPage + halfVisiblePages() * 2,
				visiblePages
			),
			totalPages
		));

		const firstPage = $.derived(() => Math.max(1, lastPage() - visiblePages + 1));

		// Generate array of page numbers to display
		const pageNumbers = $.derived(() => paginationRange(firstPage(), lastPage()));

		// Navigation helper functions
		function goToNextPage() {
			onPageChange(Math.min(currentPage + 1, totalPages));
		}

		function goToPreviousPage() {
			onPageChange(Math.max(currentPage - 1, 1));
		}

		const $$d = $.derived(() => paginationNav({ layout })),
			base = $.derived(() => $$d().base),
			tableDiv = $.derived(() => $$d().tableDiv),
			span = $.derived(() => $$d().span),
			prev = $.derived(() => $$d().prev),
			next = $.derived(() => $$d().next);

		$$renderer.push(`<nav${$.attributes({ 'aria-label': ariaLabel, ...restProps })}>`);

		if (layout === "table") {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(tableDiv()({ class: clsx(theme()?.tableDiv, styling().tableDiv) })))}>Showing <span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}>${$.escape(currentPage)}</span> of <span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}>${$.escape(totalPages)}</span> Entries</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <ul${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, className) })))}><li${$.attributes({ ...restProps })}>`);

		PaginationButton($$renderer, {
			onclick: goToPreviousPage,
			disabled: currentPage === 1,
			class: prev()({ class: clsx(theme()?.prev, styling().prev) }),
			children: ($$renderer) => {
				if (prevContent) {
					$$renderer.push('<!--[0-->');
					prevContent($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(previousLabel)}`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></li> `);

		if (layout === "pagination" && pageNumbers().length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(pageNumbers());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let page = each_array[$$index];

				$$renderer.push(`<li${$.attr('aria-current', page === currentPage ? "page" : undefined)}>`);

				PaginationButton($$renderer, {
					active: page === currentPage,
					onclick: () => onPageChange(page),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(page)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <li${$.attributes({ ...restProps })}>`);

		PaginationButton($$renderer, {
			onclick: goToNextPage,
			disabled: currentPage === totalPages,
			class: next()({ class: clsx(theme()?.next, styling().next) }),
			children: ($$renderer) => {
				if (nextContent) {
					$$renderer.push('<!--[0-->');
					nextContent($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(nextLabel)}`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></li></ul></nav>`);
	});
}