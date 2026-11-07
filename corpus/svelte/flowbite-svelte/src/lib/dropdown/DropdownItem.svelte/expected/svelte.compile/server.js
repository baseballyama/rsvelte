import * as $ from 'svelte/internal/server';
import { getDropdownContext } from "$lib/context";
import { dropdownItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function DropdownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			aClass,
			children,
			activeClass,
			liClass,
			classes,
			class: className,
			href,
			onclick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("DropdownItem", untrack(() => ({ aClass, activeClass, liClass })), { aClass: "class", activeClass: "active", liClass: "li" });

		const styling = $.derived(() => classes ?? { active: activeClass, li: liClass });
		const theme = $.derived(() => getTheme("dropdownItem"));
		const ctx = getDropdownContext();
		let isActive = $.derived(() => ctx?.activeUrl && href ? href === ctx.activeUrl : false);
		const { base, active, li } = dropdownItem();

		let finalClass = $.derived(() => isActive()
			? active({ class: clsx(theme()?.active, styling().active) })
			: base({ class: clsx(theme()?.base, className) }));

		$$renderer.push(`<li${$.attr_class($.clsx(li({ class: clsx(styling().li) })))}>`);

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({ href, ...restProps, class: $.clsx(finalClass()) })}>`);
			children($$renderer);
			$$renderer.push(`<!----></a>`);
		} else if (onclick) {
			$$renderer.push(`<!--[1--><button${$.attributes({ type: 'button', ...restProps, class: $.clsx(finalClass()) })}>`);
			children($$renderer);
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...restProps, class: $.clsx(finalClass()) })}>`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></li>`);
	});
}