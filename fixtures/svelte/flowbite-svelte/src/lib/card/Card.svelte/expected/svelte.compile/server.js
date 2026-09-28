import * as $ from 'svelte/internal/server';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { card } from "./theme";
import { untrack } from "svelte";

export default function Card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = "gray",
			horizontal = false,
			shadow = "md",
			reverse = false,
			img,
			size = "sm",
			class: className,
			classes,
			imgClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Card", untrack(() => ({ imgClass })), { imgClass: "image" });

		const styling = $.derived(() => classes ?? { image: imgClass });
		const theme = $.derived(() => getTheme("card"));

		const $$d = $.derived(() => card({
				size,
				color,
				shadow,
				horizontal,
				reverse,
				href: !!restProps.href
			})),
			base = $.derived(() => $$d().base),
			image = $.derived(() => $$d().image);

		function childSlot($$renderer) {
			if (img) {
				$$renderer.push(`<!--[0--><img${$.attr_class($.clsx(image()({ class: clsx(theme()?.image, styling().image) })))}${$.attr('src', img)} alt="" loading="lazy" onerror="this.__e=event"/> `);
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (restProps.href === undefined) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				...restProps,
				class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
			})}>`);

			childSlot($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({
				...restProps,
				class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
			})}>`);

			childSlot($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}