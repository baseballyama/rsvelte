import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getToolbarContext } from "$lib/context";
import { toolbarGroup } from "./theme";

export default function ToolbarGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			spacing,
			padding,
			position = "middle",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("toolbarGroup"));
		const groupCls = $.derived(() => toolbarGroup({ spacing, padding, position, class: clsx(theme(), className) }));
		const ctx = getToolbarContext();

		if (ctx) ctx.separators = true;

		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(groupCls()) })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}