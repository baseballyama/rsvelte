import * as $ from 'svelte/internal/server';
import { footerBrand } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function FooterBrand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			aClass,
			spanClass,
			imgClass,
			href,
			src,
			alt,
			name,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("footerBrand"));

		const $$d = $.derived(footerBrand),
			base = $.derived(() => $$d().base),
			span = $.derived(() => $$d().span),
			img = $.derived(() => $$d().img);

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({
				...restProps,
				href,
				class: $.clsx(base()({ class: clsx(theme()?.base, aClass) }))
			})}>`);

			if (src) {
				$$renderer.push(`<!--[0--><img${$.attr('src', src)}${$.attr_class($.clsx(img()({ class: clsx(theme()?.img, imgClass) })))}${$.attr('alt', alt)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (name) {
				$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, spanClass) })))}>${$.escape(name)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a>`);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attr('src', src)}${$.attr_class($.clsx(img()({ class: clsx(imgClass) })))}${$.attr('alt', alt)}/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}