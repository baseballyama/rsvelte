import * as $ from 'svelte/internal/server';
import { warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { laptop } from "./theme";
import { untrack } from "svelte";

export default function Laptop($$renderer, $$props) {
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

		warnThemeDeprecation("Laptop", untrack(() => ({ divClass, div2Class, div3Class, div4Class })), {
			divClass: "class",
			div2Class: "top",
			div3Class: "lefttop",
			div4Class: "leftBot",
			div5Class: "right",
			div6Class: "slot"
		});

		const styling = $.derived(() => classes ?? { inner: div2Class, bot: div3Class, botCen: div4Class });
		const { base, inner, bot, botCen } = laptop();

		$$renderer.push(`<div${$.attributes({ ...restProps })}><div${$.attr_class($.clsx(base({ class: clsx(className ?? divClass) })))}><div${$.attr_class($.clsx(inner({ class: clsx(styling().inner) })))}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div${$.attr_class($.clsx(bot({ class: clsx(styling().bot) })))}><div${$.attr_class($.clsx(botCen({ class: clsx(styling().botCen) })))}></div></div></div>`);
	});
}