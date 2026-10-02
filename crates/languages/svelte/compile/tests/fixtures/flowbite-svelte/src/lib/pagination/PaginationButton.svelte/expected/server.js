import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { paginationButton } from "./theme";
import { getPaginationContext } from "$lib/context";
import { getTheme } from "$lib/theme/themeUtils";

export default function PaginationButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			size,
			onclick,
			disabled = false,
			class: className,
			href,
			active = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("paginationButton"));

		// Get context - it will be undefined if used outside Pagination
		const ctx = getPaginationContext();

		const paginationCls = $.derived(() => {
			if (active && ctx?.activeClasses) {
				return paginationButton({
					size: ctx?.size ?? size,
					active: false, // Set to false to avoid theme's active styles
					group: ctx?.group ?? false,
					table: ctx?.table ?? false,
					disabled,
					class: clsx(theme(), ctx.activeClasses, className)
				});
			}

			// Use default theme styles
			return paginationButton({
				size: ctx?.size ?? size,
				active,
				group: ctx?.group ?? false,
				table: ctx?.table ?? false,
				disabled,
				class: clsx(theme(), className)
			});
		});

		function handleClick(e) {
			if (disabled) {
				e.preventDefault();

				return;
			}

			if (onclick) onclick();
		}

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
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...restProps, disabled, class: $.clsx(paginationCls()) })}>`);

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