import * as $ from 'svelte/internal/server';
import { testimonialPlaceholder } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function TestimonialPlaceholder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, classes, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("testimonialPlaceholder"));
		const { base, lineA, lineB, svg, content } = testimonialPlaceholder();

		$$renderer.push(`<div${$.attributes({
			role: 'status',
			...restProps,
			class: $.clsx(base({ class: clsx(theme()?.base, className) }))
		})}><div${$.attr_class($.clsx(lineB({
			class: clsx("mx-auto mb-2.5 h-2.5 max-w-[640px]", theme()?.lineB, classes?.lineB)
		})))}></div> <div${$.attr_class($.clsx(lineB({
			class: clsx("mx-auto h-2.5 max-w-[540px]", theme()?.lineB, classes?.lineB)
		})))}></div> <div${$.attr_class($.clsx(content({ class: clsx(theme()?.content, classes?.content) })))}><svg${$.attr_class($.clsx(svg({ class: clsx(theme()?.svg, classes?.svg) })))} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path></svg> <div${$.attr_class($.clsx(lineA({
			class: clsx("me-3 h-2.5 w-20", theme()?.lineA, classes?.lineA)
		})))}></div> <div${$.attr_class($.clsx(lineA({ class: clsx("h-2 w-24", theme()?.lineA, classes?.lineA) })))}></div></div> <span class="sr-only">Loading...</span></div>`);
	});
}