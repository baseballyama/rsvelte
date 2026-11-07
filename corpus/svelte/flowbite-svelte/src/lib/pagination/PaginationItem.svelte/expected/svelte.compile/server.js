import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { paginationItem } from "./theme";
import { getPaginationContext } from "$lib/context";
import { getTheme } from "$lib/theme/themeUtils";

export default function PaginationItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			size,
			class: className,
			href,
			active,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("paginationItem"));

		// Get context - it will be undefined if used outside Pagination
		const ctx = getPaginationContext();

		const paginationCls = $.derived(() => paginationItem({
			size: ctx?.size ?? size,
			active,
			group: ctx?.group ?? false,
			table: ctx?.table ?? false,
			class: clsx(theme(), className)
		}));

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({ href, ...restProps, class: $.clsx(paginationCls()) })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a>`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...restProps, class: $.clsx(paginationCls()) })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}