import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { img } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Img($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			size,
			effect: imgEffect,
			align,
			caption,
			class: className,
			classes,
			figClass,
			captionClass,
			href,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Img", untrack(() => ({ figClass, captionClass })), { figClass: "figure", captionClass: "caption" });

		const styling = $.derived(() => ({
			figure: figClass || classes?.figure,
			caption: captionClass || classes?.caption
		}));

		const theme = $.derived(() => getTheme("img"));

		let $$d = $.derived(() => img({ size, effect: imgEffect, align })),
			base = $.derived(() => $$d().base),
			figure = $.derived(() => $$d().figure),
			figureCaption = $.derived(() => $$d().caption);

		// Determine if using slot or traditional props
		const useSlot = $.derived(() => !!children);

		// Compute the final class string to pass to children
		const imgClass = $.derived(() => base()({ class: clsx(theme()?.base, className) }));

		function imageSlot($$renderer) {
			if (caption) {
				$$renderer.push(`<!--[0--><figure${$.attr_class($.clsx(figure()({ class: clsx(theme()?.figure, styling().figure) })))}>`);

				if (useSlot()) {
					$$renderer.push('<!--[0-->');
					children?.($$renderer, { class: imgClass(), restProps });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attributes({ ...restProps, class: $.clsx(imgClass()) })} onload="this.__e=event" onerror="this.__e=event"/>`);
				}

				$$renderer.push(`<!--]--> <figcaption${$.attr_class($.clsx(figureCaption()({ class: clsx(theme()?.caption, styling().caption) })))}>${$.html(caption)}</figcaption></figure>`);
			} else if (useSlot()) {
				$$renderer.push('<!--[1-->');
				children?.($$renderer, { class: imgClass(), restProps });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><img${$.attributes({ ...restProps, class: $.clsx(imgClass()) })} onload="this.__e=event" onerror="this.__e=event"/>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attr('href', href)}>`);
			imageSlot($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
			imageSlot($$renderer);
		}

		$$renderer.push(`<!--]-->`);
	});
}