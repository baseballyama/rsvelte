import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { sidebarBrand } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function SidebarBrand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			site,
			imgClass,
			spanClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("SidebarBrand", untrack(() => ({ imgClass, spanClass })), { imgClass: "img", spanClass: "span" });

		const styling = $.derived(() => classes ?? { img: imgClass, span: spanClass });
		const theme = $.derived(() => getTheme("sidebarBrand"));

		const $$d = $.derived(sidebarBrand),
			base = $.derived(() => $$d().base),
			img = $.derived(() => $$d().img),
			span = $.derived(() => $$d().span);

		$$renderer.push(`<a${$.attributes({
			...restProps,
			href: site?.href ? site.href : "/",
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}>`);

		if (site) {
			$$renderer.push(`<!--[0--><img${$.attr('src', site.img)}${$.attr_class($.clsx(img()({ class: clsx(theme()?.img, styling().img) })))}${$.attr('alt', site.name)}/> <span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}>${$.escape(site.name)}</span>`);
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></a>`);
	});
}