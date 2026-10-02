import * as $ from 'svelte/internal/server';
import { bottomNavHeader } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function BottomNavHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			classes,
			outerClass,
			innerClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("BottomNavHeader", untrack(() => ({ innerClass, outerClass })), { innerClass: "inner", outerClass: "class" });

		const styling = $.derived(() => classes ?? { innerDiv: innerClass });

		// Theme context
		const theme = $.derived(() => getTheme("bottomNavHeader"));

		const $$d = $.derived(bottomNavHeader),
			innerDiv = $.derived(() => $$d().innerDiv),
			base = $.derived(() => $$d().base);

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className ?? outerClass) }))
		})}><div${$.attr_class($.clsx(innerDiv()({ class: clsx(theme()?.innerDiv, styling().innerDiv) })))} role="group">`);

		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}