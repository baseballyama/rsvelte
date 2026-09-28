import * as $ from 'svelte/internal/server';
import { helper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Helper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			color = "gray",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("helper"));
		const base = $.derived(() => helper({ color, class: clsx(theme(), className) }));

		$$renderer.push(`<p${$.attributes({ ...restProps, class: $.clsx(base()) })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
	});
}