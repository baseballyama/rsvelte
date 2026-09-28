import * as $ from 'svelte/internal/server';
import { SvelteDate } from "svelte/reactivity";
import { footerCopyright } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function FooterCopyright($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			spanClass,
			aClass,
			href,
			by,
			copyrightMessage = "All Rights Reserved.",
			year,
			bySpanClass,
			classes,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("FooterCopyright", untrack(() => ({ aClass, spanClass, bySpanClass })), { aClass: "link", spanClass: "class", bySpanClass: "bySpan" });

		// link, bySpan
		const styling = $.derived(() => classes ?? { bySpan: bySpanClass, link: aClass });

		const theme = $.derived(() => getTheme("footerCopyright"));
		const effectiveYear = $.derived(() => year ?? new SvelteDate().getFullYear());
		const { base, link, bySpan } = footerCopyright();

		$$renderer.push(`<span${$.attr_class($.clsx(base({ class: clsx(theme()?.base, className ?? spanClass) })))}>© ${$.escape(effectiveYear())} `);

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({
				...restProps,
				href,
				class: $.clsx(link({ class: clsx(theme()?.link, styling().link) }))
			})}>${$.escape(by)}</a>`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(bySpan({ class: clsx(theme()?.bySpan, styling().bySpan) })))}>${$.escape(by)}</span>`);
		}

		$$renderer.push(`<!--]--> ${$.escape(copyrightMessage)}</span>`);
	});
}