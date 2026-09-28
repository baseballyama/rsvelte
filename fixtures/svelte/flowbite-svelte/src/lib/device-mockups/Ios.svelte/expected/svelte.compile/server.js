import * as $ from 'svelte/internal/server';
import { ios } from "./theme";
import { warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { untrack } from "svelte";

export default function Ios($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			classes,
			divClass,
			div2Class,
			div3Class,
			div4Class,
			div5Class,
			div6Class,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation(
			"Ios",
			untrack(() => ({
				divClass,
				div2Class,
				div3Class,
				div4Class,
				div5Class,
				div6Class
			})),
			{
				divClass: "class",
				div2Class: "top",
				div3Class: "lefttop",
				div4Class: "leftBot",
				div5Class: "right",
				div6Class: "slot"
			}
		);

		const styling = $.derived(() => classes ?? {
			top: div2Class,
			leftTop: div3Class,
			leftBot: div4Class,
			right: div5Class,
			slot: div6Class
		});

		const { base, slot, top, leftTop, leftBot, right } = ios();

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(base({ class: clsx(className ?? divClass) }))
		})}><div${$.attr_class($.clsx(top({ class: clsx(styling().top) })))}></div> <div${$.attr_class($.clsx(leftTop({ class: clsx(styling().leftTop) })))}></div> <div${$.attr_class($.clsx(leftBot({ class: clsx(styling().leftBot) })))}></div> <div${$.attr_class($.clsx(right({ class: clsx(styling().right) })))}></div> <div${$.attr_class($.clsx(slot({ class: clsx(styling().slot) })))}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}