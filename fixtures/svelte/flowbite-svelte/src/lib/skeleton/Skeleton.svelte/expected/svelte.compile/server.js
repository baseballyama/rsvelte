import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { skeleton } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Skeleton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			size = "sm",
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("skeleton"));

		const $$d = $.derived(() => skeleton({ size })),
			wrapper = $.derived(() => $$d().wrapper),
			line = $.derived(() => $$d().line);

		$$renderer.push(`<div${$.attributes({
			role: 'status',
			...restProps,
			class: $.clsx(wrapper()({ class: clsx(theme()?.wrapper, className) }))
		})}><div${$.attr_class($.clsx(line()({
			class: clsx("mb-4 h-2.5 w-1/2", theme()?.line, classes?.line)
		})))}></div> <div${$.attr_class($.clsx(line()({
			class: clsx("mb-2.5 h-2 w-9/12", theme()?.line, classes?.line)
		})))}></div> <div${$.attr_class($.clsx(line()({ class: clsx("mb-2.5 h-2", theme()?.line, classes?.line) })))}></div> <div${$.attr_class($.clsx(line()({ class: clsx("mb-2.5 h-2", theme()?.line, classes?.line) })))}></div> <div${$.attr_class($.clsx(line()({
			class: clsx("mb-2.5 h-2 w-10/12", theme()?.line, classes?.line)
		})))}></div> <div${$.attr_class($.clsx(line()({
			class: clsx("mb-2.5 h-2 w-11/12", theme()?.line, classes?.line)
		})))}></div> <div${$.attr_class($.clsx(line()({ class: clsx("h-2 w-9/12", theme()?.line, classes?.line) })))}></div> <span class="sr-only">Loading...</span></div>`);
	});
}