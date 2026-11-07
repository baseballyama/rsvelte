import * as $ from 'svelte/internal/server';
import { label } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = "gray",
			show = true,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("label"));
		let base = $.derived(() => label({ color, class: clsx(theme(), className) }));

		if (show) {
			$$renderer.push(`<!--[0--><label${$.attributes({ ...restProps, class: $.clsx(base()) })}>`);
			children($$renderer);
			$$renderer.push(`<!----></label>`);
		} else {
			$$renderer.push('<!--[-1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}