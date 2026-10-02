import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { tableHeadCell } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function TableHeadCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("tableHeadCell"));

		$$renderer.push(`<th${$.attributes({
			...restProps,
			class: $.clsx(tableHeadCell({ class: clsx(theme(), className) }))
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></th>`);
	});
}