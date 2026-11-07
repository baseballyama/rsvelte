import * as $ from 'svelte/internal/server';
import { getTableContext } from "$lib/context";
import { tableBodyRow } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function TableBodyRow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			color,
			striped,
			hoverable,
			border,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("tableBodyRow"));
		const tableCtx = getTableContext();

		// for reactivity with svelte context
		let compoColor = $.derived(() => color || tableCtx?.color || "default");

		let compoHoverable = $.derived(() => hoverable || tableCtx?.hoverable || false);
		let compoStriped = $.derived(() => striped || tableCtx?.striped || false);
		let compoBorder = $.derived(() => border || tableCtx?.border || false);

		const base = $.derived(() => tableBodyRow({
			color: compoColor(),
			hoverable: compoHoverable(),
			striped: compoStriped(),
			border: compoBorder(),
			class: clsx(theme(), className)
		}));

		$$renderer.push(`<tr${$.attributes({ ...restProps, class: $.clsx(base()) })}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></tr>`);
	});
}