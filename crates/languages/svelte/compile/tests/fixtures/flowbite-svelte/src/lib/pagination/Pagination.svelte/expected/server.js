import * as $ from 'svelte/internal/server';
import { pagination } from "./theme";
import PaginationItem from "./PaginationItem.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { setPaginationContext } from "$lib/context";
import clsx from "clsx";

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			pages = [],
			previous,
			next,
			prevContent,
			nextContent,
			table,
			size,
			ariaLabel,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("pagination"));

		// Create context object
		const ctx = {
			get group() {
				return true;
			},

			get table() {
				return table;
			},

			get size() {
				return size;
			}
		};

		// Set context during initialization
		setPaginationContext(ctx);

		const paginationCls = $.derived(() => pagination({ table, size, class: clsx(theme()) }));

		$$renderer.push(`<nav${$.attr('aria-label', ariaLabel)}><ul${$.attr_class($.clsx(paginationCls()))}>`);

		if (typeof previous === "function") {
			$$renderer.push(`<!--[0--><li${$.attributes({ ...restProps })}>`);

			PaginationItem($$renderer, {
				size,
				onclick: () => previous(),
				class: table
					? "rounded-none rounded-l"
					: "rounded-none  rounded-s-lg",

				children: ($$renderer) => {
					if (prevContent) {
						$$renderer.push('<!--[0-->');
						prevContent($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1-->Previous`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(pages);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let { name, href, active, size } = each_array[index];

			$$renderer.push(`<li${$.attributes({ ...restProps })}>`);

			PaginationItem($$renderer, {
				size,
				active,
				href,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(name)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]--> `);

		if (typeof next === "function") {
			$$renderer.push(`<!--[0--><li${$.attributes({ ...restProps })}>`);

			PaginationItem($$renderer, {
				size,
				onclick: () => next(),
				class: table
					? "rounded-none rounded-r"
					: "rounded-none rounded-e-lg",

				children: ($$renderer) => {
					if (nextContent) {
						$$renderer.push('<!--[0-->');
						nextContent($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1-->Next`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></ul></nav>`);
	});
}