import * as $ from 'svelte/internal/server';
import { warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { smartwatch } from "./theme";
import { untrack } from "svelte";

export default function Smartwatch($$renderer, $$props) {
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
			"Smartwatch",
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
				div3Class: "rightTop",
				div4Class: "rightBot",
				div5Class: "bot",
				div6Class: "slot"
			}
		);

		const styling = $.derived(() => classes ?? {
			top: div2Class,
			rightTop: div3Class,
			rightBot: div4Class,
			bot: div5Class,
			slot: div6Class
		});

		const { base, top, rightTop, rightBot, bot, slot } = smartwatch();

		$$renderer.push(`<div${$.attributes({ ...restProps })}><div${$.attr_class($.clsx(base({ class: clsx(className ?? divClass) })))}></div> <div${$.attr_class($.clsx(top({ class: clsx(styling().top) })))}><div${$.attr_class($.clsx(rightTop({ class: clsx(styling().rightTop) })))}></div> <div${$.attr_class($.clsx(rightBot({ class: clsx(styling().rightBot) })))}></div> <div${$.attr_class($.clsx(slot({ class: clsx(styling().slot) })))}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div${$.attr_class($.clsx(bot({ class: clsx(styling().bot) })))}></div></div>`);
	});
}