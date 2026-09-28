import * as $ from 'svelte/internal/server';
import { widgetPlaceholder } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function WidgetPlaceholder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, classes } = $$props;
		const theme = $.derived(() => getTheme("widgetPlaceholder"));
		const { base, wrapper, vLine, hLine } = widgetPlaceholder({});

		$$renderer.push(`<div role="status"${$.attr_class($.clsx(base({ class: clsx(theme()?.base, className) })))}><div${$.attr_class($.clsx(hLine({ class: clsx("mb-2.5 h-2.5 w-32", classes?.hLine) })))}></div> <div${$.attr_class($.clsx(hLine({ class: clsx("mb-10 h-2 w-48", classes?.hLine) })))}></div> <div${$.attr_class($.clsx(wrapper()))}><div${$.attr_class($.clsx(vLine({ class: clsx("h-72", classes?.vLine) })))}></div> <div${$.attr_class($.clsx(vLine({ class: clsx("h-56", classes?.vLine) })))}></div> <div${$.attr_class($.clsx(vLine({ class: clsx("h-72", classes?.vLine) })))}></div> <div${$.attr_class($.clsx(vLine({ class: clsx("h-64", classes?.vLine) })))}></div> <div${$.attr_class($.clsx(vLine({ class: clsx("h-80", classes?.vLine) })))}></div> <div${$.attr_class($.clsx(vLine({ class: clsx("h-72", classes?.vLine) })))}></div> <div${$.attr_class($.clsx(vLine({ class: clsx("h-80", classes?.vLine) })))}></div></div> <span class="sr-only">Loading...</span></div>`);
	});
}