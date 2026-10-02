import * as $ from 'svelte/internal/server';
import { getTableContext } from "$lib/context";
import TableHeadCell from "./TableHeadCell.svelte";
import { tableHead } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function TableHead($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			headerSlot,
			color,
			striped,
			border,
			class: className,
			headItems,
			defaultRow = true,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("tableHead"));
		const tableCtx = getTableContext();

		// for reactivity with svelte context
		let compoColor = $.derived(() => color ? color : tableCtx?.color || "default");

		let compoStriped = $.derived(() => striped ? striped : tableCtx?.striped || false);
		let compoBorder = $.derived(() => border ? border : tableCtx?.border || false);

		const base = $.derived(() => tableHead({
			color: compoColor(),
			border: compoBorder(),
			striped: compoStriped(),
			class: clsx(theme(), className)
		}));

		function getItemText(item) {
			if (typeof item === "object" && "text" in item) {
				return item.text;
			}

			return String(item);
		}

		$$renderer.push(`<thead${$.attributes({ ...restProps, class: $.clsx(base()) })}>`);

		if (headItems) {
			$$renderer.push('<!--[0-->');

			if (headerSlot) {
				$$renderer.push('<!--[0-->');
				headerSlot($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <tr><!--[-->`);

			const each_array = $.ensure_array_like(headItems);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];

				TableHeadCell($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(getItemText(item))}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></tr>`);
		} else if (children) {
			$$renderer.push('<!--[1-->');

			if (defaultRow) {
				$$renderer.push(`<!--[0--><tr>`);
				children($$renderer);
				$$renderer.push(`<!----></tr>`);
			} else {
				$$renderer.push('<!--[-1-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></thead>`);
	});
}