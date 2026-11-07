import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { hr } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Hr($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			divClass,
			innerDivClass,
			class: className,
			classes,
			divProps = {},
			hrProps = {},
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Hr", untrack(() => ({ divClass, innerDivClass })), { divClass: "div", innerDivClass: "content" });

		const styling = $.derived(() => classes ?? { div: divClass, content: innerDivClass });
		const theme = $.derived(() => getTheme("hr"));
		const bg = $.derived(() => classes?.bg ?? "bg-gray-200 dark:bg-gray-700");

		// for backward compatibility and ...restPorps will be removed and use only ..divProps and ...hrProps in future
		const mergedDivProps = $.derived(() => ({ ...restProps, ...divProps }));

		const mergedHrProps = $.derived(() => ({ ...restProps, ...hrProps }));

		let $$d = $.derived(() => hr({ withChildren: !!children })),
			base = $.derived(() => $$d().base),
			div = $.derived(() => $$d().div),
			content = $.derived(() => $$d().content);

		if (children) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				...mergedDivProps(),
				class: $.clsx(div()({ class: clsx(theme()?.div, styling().div) }))
			})}><hr${$.attributes({
				...mergedHrProps(),
				class: $.clsx(base()({ class: clsx(theme()?.base, className, bg()) }))
			})}/> <div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, styling().content) })))}>`);

			children($$renderer);
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><hr${$.attributes({
				...mergedHrProps(),
				class: $.clsx(base()({ class: clsx(theme()?.base, className, bg()) }))
			})}/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}