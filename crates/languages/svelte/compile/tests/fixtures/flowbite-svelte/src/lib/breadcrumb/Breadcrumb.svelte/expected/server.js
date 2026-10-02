import * as $ from 'svelte/internal/server';
import { breadcrumb } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Breadcrumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			solid = false,
			class: className,
			classes,
			olClass,
			ariaLabel = "Breadcrumb",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Breadcrumb", untrack(() => ({ olClass })), { olClass: "list" });

		const styling = $.derived(() => classes ?? { list: olClass });
		const theme = $.derived(() => getTheme("breadcrumb"));

		const $$d = $.derived(() => breadcrumb({ solid })),
			base = $.derived(() => $$d().base),
			list = $.derived(() => $$d().list);

		let classNav = $.derived(() => base()({ class: clsx(theme()?.base, className) }));
		let classList = $.derived(() => list()({ class: clsx(theme()?.list, styling().list) }));

		$$renderer.push(`<nav${$.attributes({
			'aria-label': ariaLabel,
			...restProps,
			class: $.clsx(classNav())
		})}><ol${$.attr_class($.clsx(classList()))}>`);

		children($$renderer);
		$$renderer.push(`<!----></ol></nav>`);
	});
}