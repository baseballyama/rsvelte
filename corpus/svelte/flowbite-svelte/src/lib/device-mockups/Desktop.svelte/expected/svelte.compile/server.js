import * as $ from 'svelte/internal/server';
import { warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { desktop } from "./theme";
import { untrack } from "svelte";

export default function Desktop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			classes,
			divClass,
			div2Class,
			div3Class,
			div4Class,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Desktop", untrack(() => ({ divClass, div2Class, div3Class, div4Class })), {
			divClass: "class",
			div2Class: "inner",
			div3Class: "bot",
			div4Class: "botUnder"
		});

		const styling = $.derived(() => classes ?? { inner: div2Class, bot: div3Class, botUnder: div4Class });
		const { base, inner, bot, botUnder } = desktop();

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(base({ class: clsx(className ?? divClass) }))
		})}><div${$.attr_class($.clsx(inner({ class: clsx(styling().inner) })))}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div${$.attr_class($.clsx(bot({ class: clsx(styling().bot) })))}></div> <div${$.attr_class($.clsx(botUnder({ class: clsx(styling().botUnder) })))}></div>`);
	});
}