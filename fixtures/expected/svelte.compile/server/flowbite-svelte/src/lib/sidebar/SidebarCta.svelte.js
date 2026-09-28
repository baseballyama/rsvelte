import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { sidebarCta } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function SidebarCta($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			icon,
			divClass,
			spanClass,
			label,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("SidebarCta", untrack(() => ({ divClass, spanClass })), { divClass: "div", spanClass: "span" });

		const styling = $.derived(() => classes ?? { div: divClass, span: spanClass });
		const theme = $.derived(() => getTheme("sidebarCta"));

		const $$d = $.derived(sidebarCta),
			base = $.derived(() => $$d().base),
			div = $.derived(() => $$d().div),
			span = $.derived(() => $$d().span);

		$$renderer.push(`<div${$.attributes({
			...restProps,
			id: 'dropdown-cta',
			class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
			role: 'alert'
		})}><div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, styling().div) })))}><span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}>${$.escape(label)}</span> `);

		if (icon) {
			$$renderer.push('<!--[0-->');
			icon($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}