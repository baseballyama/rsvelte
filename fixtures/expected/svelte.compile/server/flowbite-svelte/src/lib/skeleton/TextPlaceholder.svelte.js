import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { textPlaceholder } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function TextPlaceholder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			size = "sm",
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("textPlaceholder"));

		const $$d = $.derived(() => textPlaceholder({ size })),
			base = $.derived(() => $$d().base),
			div = $.derived(() => $$d().div),
			lineA = $.derived(() => $$d().lineA),
			lineB = $.derived(() => $$d().lineB);

		$$renderer.push(`<div${$.attributes({
			role: 'status',
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}><div${$.attr_class($.clsx(div()({ class: clsx("w-full", theme()?.div, classes?.div) })))}><div${$.attr_class($.clsx(lineA()({ class: clsx("h-2.5 w-32", theme()?.lineA, classes?.lineA) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-24", theme()?.lineB, classes?.lineB) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-full", theme()?.lineB, classes?.lineB) })))}></div></div> <div${$.attr_class($.clsx(div()({ class: clsx("w-11/12", theme()?.div, classes?.div) })))}><div${$.attr_class($.clsx(lineA()({ class: clsx("h-2.5 w-full", theme()?.lineA, classes?.lineA) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-full", theme()?.lineB, classes?.lineB) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-24", theme()?.lineB, classes?.lineB) })))}></div></div> <div${$.attr_class($.clsx(div()({ class: clsx("w-9/12", theme()?.div, classes?.div) })))}><div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-full", theme()?.lineB, classes?.lineB) })))}></div> <div${$.attr_class($.clsx(lineA()({ class: clsx("h-2.5 w-80", theme()?.lineA, classes?.lineA) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-full", theme()?.lineB, classes?.lineB) })))}></div></div> <div${$.attr_class($.clsx(div()({ class: clsx("w-11/12", theme()?.div, classes?.div) })))}><div${$.attr_class($.clsx(lineA()({ class: clsx("h-2.5 w-full", theme()?.lineA, classes?.lineA) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-full", theme()?.lineB, classes?.lineB) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-24", theme()?.lineB, classes?.lineB) })))}></div></div> <div${$.attr_class($.clsx(div()({ class: clsx("w-10/12", theme()?.div, classes?.div) })))}><div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-32", theme()?.lineB, classes?.lineB) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-24", theme()?.lineB, classes?.lineB) })))}></div> <div${$.attr_class($.clsx(lineA()({ class: clsx("h-2.5 w-full", theme()?.lineA, classes?.lineA) })))}></div></div> <div${$.attr_class($.clsx(div()({ class: clsx("w-8/12", theme()?.div) })))}><div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-full", theme()?.lineB, classes?.lineB) })))}></div> <div${$.attr_class($.clsx(lineA()({ class: clsx("h-2.5 w-80", theme()?.lineA, classes?.lineA) })))}></div> <div${$.attr_class($.clsx(lineB()({ class: clsx("h-2.5 w-full", theme()?.lineB, classes?.lineB) })))}></div></div> <span class="sr-only">Loading...</span></div>`);
	});
}