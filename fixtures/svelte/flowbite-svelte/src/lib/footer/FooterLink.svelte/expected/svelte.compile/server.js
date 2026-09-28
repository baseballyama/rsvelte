import * as $ from 'svelte/internal/server';
import { footerLink } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function FooterLink($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			liClass,
			aClass,
			href,
			classes,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("FooterLink", untrack(() => ({ liClass, aClass })), { liClass: "class", aClass: "link" });

		// link, bySpan
		const styling = $.derived(() => classes ?? { link: aClass });

		const theme = $.derived(() => getTheme("footerLink"));
		const { base, link } = footerLink();

		$$renderer.push(`<li${$.attr_class($.clsx(base({ class: clsx(theme()?.base, className ?? liClass) })))}><a${$.attributes({
			...restProps,
			href,
			class: $.clsx(link({ class: clsx(theme()?.link, styling().link) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></a></li>`);
	});
}