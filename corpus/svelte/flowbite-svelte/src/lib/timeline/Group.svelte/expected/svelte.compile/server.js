import * as $ from 'svelte/internal/server';
import { group } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			divClass,
			timeClass,
			date,
			olClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Group", untrack(() => ({ divClass, timeClass, olClass })), { divClass: "class", timeClass: "time", olClass: "ol" });

		const styling = $.derived(() => ({ time: timeClass, ol: olClass }));
		const theme = $.derived(() => getTheme("group"));

		const $$d = $.derived(group),
			div = $.derived(() => $$d().div),
			time = $.derived(() => $$d().time),
			ol = $.derived(() => $$d().ol);

		$$renderer.push(`<div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, className ?? divClass) })))}><time${$.attr_class($.clsx(time()({ class: clsx(theme()?.time, styling().time) })))}>${$.escape(date)}</time> <ol${$.attributes({
			...restProps,
			class: $.clsx(ol()({ class: clsx(theme()?.ol, styling().ol) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></ol></div>`);
	});
}