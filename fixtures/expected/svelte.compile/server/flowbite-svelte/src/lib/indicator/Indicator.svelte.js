import * as $ from 'svelte/internal/server';
import { indicator } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = "primary",
			cornerStyle = "circular",
			size = "md",
			border = false,
			placement,
			offset = true,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("indicator"));
		let hasChildren = $.derived(() => !!children);

		const base = $.derived(() => indicator({
			color,
			size,
			cornerStyle,
			border,
			placement,
			offset,
			hasChildren: hasChildren(),
			class: clsx(theme(), className)
		}));

		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(base()) })}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}