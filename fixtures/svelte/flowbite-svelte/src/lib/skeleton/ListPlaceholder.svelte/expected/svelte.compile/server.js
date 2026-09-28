import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { listPlaceholder } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function ListPlaceholder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			itemNumber = 5,
			size = "md",
			rounded,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("listPlaceholder"));

		const $$d = $.derived(() => listPlaceholder({ size, rounded })),
			base = $.derived(() => $$d().base),
			item = $.derived(() => $$d().item),
			content = $.derived(() => $$d().content),
			title = $.derived(() => $$d().title),
			subTitle = $.derived(() => $$d().subTitle),
			extra = $.derived(() => $$d().extra);

		let items = $.derived(() => [...Array(itemNumber).keys()]);

		$$renderer.push(`<div${$.attributes({
			role: 'status',
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}><!--[-->`);

		const each_array = $.ensure_array_like(items());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<div${$.attr_class($.clsx(item()({
				class: clsx(i > 0 ? "pt-4" : "", theme()?.item, classes?.item)
			})))}><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, classes?.content) })))}><div${$.attr_class($.clsx(title()({ class: clsx(theme()?.title, classes?.title) })))}></div> <div${$.attr_class($.clsx(subTitle()({ class: clsx(theme()?.subTitle, classes?.subTitle) })))}></div></div> <div${$.attr_class($.clsx(extra()({ class: clsx(theme()?.extra, classes?.extra) })))}></div></div>`);
		}

		$$renderer.push(`<!--]--> <span class="sr-only">Loading...</span></div>`);
	});
}