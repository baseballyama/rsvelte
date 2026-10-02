import * as $ from 'svelte/internal/server';
import { gallery } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Gallery($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			figure,
			items = [],
			imgClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Gallery", untrack(() => ({ imgClass })), { imgClass: "image" });

		const styling = $.derived(() => classes ?? { image: imgClass });
		const theme = $.derived(() => getTheme("gallery"));

		function init(node) {
			if (getComputedStyle(node).gap === "normal") node.style.gap = "inherit";
		}

		const { image, div } = gallery();

		function _figure($$renderer, item) {
			$$renderer.push(`<div><img${$.attributes({
				src: item.src,
				alt: item.alt,
				class: $.clsx(image({ class: clsx(theme()?.image, styling().image) })),
				...restProps
			})} onload="this.__e=event" onerror="this.__e=event"/></div>`);
		}

		$$renderer.push(`<div${$.attr_class($.clsx(div({ class: clsx(theme()?.div, className) })))}>`);

		const each_array = $.ensure_array_like(items);

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];

				if (figure) {
					$$renderer.push('<!--[0-->');
					figure($$renderer, item);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
					_figure($$renderer, item);
				}

				$$renderer.push(`<!--]-->`);
			}
		} else {
			$$renderer.push('<!--[!-->');

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}