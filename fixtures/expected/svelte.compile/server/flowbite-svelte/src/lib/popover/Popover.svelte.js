import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import Popper from "../utils/Popper.svelte";
import { popover } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Popover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title: titleSlot,
			color = "default",
			trigger = "hover",
			defaultClass,
			arrow = true,
			children,
			placement = "top",
			class: className,
			classes,
			isOpen = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Popover", untrack(() => ({ defaultClass })), { defaultClass: "content" });

		const styling = $.derived(() => classes ?? { content: defaultClass });
		const theme = $.derived(() => getTheme("popover"));

		let $$d = $.derived(() => popover({ color })),
			base = $.derived(() => $$d().base),
			title = $.derived(() => $$d().title),
			h3 = $.derived(() => $$d().h3),
			content = $.derived(() => $$d().content);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Popper($$renderer, $.spread_props([
				restProps,
				{
					placement,
					trigger,
					arrow,
					class: base()({ class: clsx(theme()?.base, className) }),
					get isOpen() {
						return isOpen;
					},

					set isOpen($$value) {
						isOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (typeof titleSlot === "string") {
							$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(title()({ class: clsx(theme()?.title, classes?.title) })))}><h3${$.attr_class($.clsx(h3()({ class: clsx(theme()?.h3, classes?.h3) })))}>${$.escape(titleSlot)}</h3></div>`);
						} else if (titleSlot) {
							$$renderer.push('<!--[1-->');
							titleSlot($$renderer);
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, styling().content) })))}>`);
						children($$renderer);
						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { isOpen });
	});
}