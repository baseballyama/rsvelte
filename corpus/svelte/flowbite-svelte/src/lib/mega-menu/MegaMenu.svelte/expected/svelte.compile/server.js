import * as $ from 'svelte/internal/server';
import { megamenu } from "./theme";
import clsx from "clsx";
import Popper from "$lib/utils/Popper.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function MegaMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			extra,
			items = [],
			full,
			ulClass,
			isOpen = false,
			class: className,
			extraClass,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("MegaMenu", untrack(() => ({ ulClass, extraClass })), { ulClass: "ul", extraClass: "extra" });

		const styling = $.derived(() => classes ?? { ul: ulClass, extra: extraClass });
		const theme = $.derived(() => getTheme("megamenu"));

		const $$d = $.derived(() => megamenu({ full, hasExtra: !!extra })),
			base = $.derived(() => $$d().base),
			div = $.derived(() => $$d().div),
			ul = $.derived(() => $$d().ul),
			extraCls = $.derived(() => $$d().extra);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Popper($$renderer, $.spread_props([
				{
					arrow: false,
					trigger: 'click',
					placement: 'bottom',
					yOnly: full
				},
				restProps,
				{
					class: base()({ class: clsx(theme()?.base, className) }),
					get isOpen() {
						return isOpen;
					},

					set isOpen($$value) {
						isOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, classes?.div) })))}><ul${$.attr_class($.clsx(ul()({ class: clsx(theme()?.ul, styling().ul) })))}>`);

						const each_array = $.ensure_array_like(items);

						if (each_array.length !== 0) {
							$$renderer.push('<!--[-->');

							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let item = each_array[index];

								$$renderer.push(`<li>`);
								children($$renderer, { item, index });
								$$renderer.push(`<!----></li>`);
							}
						} else {
							$$renderer.push('<!--[!-->');
							children($$renderer, { item: items[0], index: 0 });
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]--></ul> `);

						if (full && extra) {
							$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(extraCls()({ class: clsx(theme()?.extra, styling().extra) })))}>`);
							extra($$renderer);
							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
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