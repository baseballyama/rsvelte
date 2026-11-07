import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { tableBodyCell } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function TableBodyCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			colspan,
			onclick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("tableBodyCell"));

		$$renderer.push(`<td${$.attributes({
			...restProps,
			class: $.clsx(tableBodyCell({ class: clsx(theme(), className) })),
			colspan: colspan ?? 1
		})}>`);

		if (onclick) {
			$$renderer.push(`<!--[0--><button>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></td>`);
	});
}