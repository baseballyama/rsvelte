import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { breadcrumbItem } from "./theme";

export default function BreadcrumbItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			icon,
			home = false,
			href,
			linkClass,
			spanClass,
			homeClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const styling = $.derived(() => classes ?? {});
		const theme = $.derived(() => getTheme("breadcrumbItem"));

		const $$d = $.derived(() => breadcrumbItem({ home, hasHref: !!href })),
			base = $.derived(() => $$d().base),
			separator = $.derived(() => $$d().separator);

		$$renderer.push(`<li${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}>`);

		if (home) {
			$$renderer.push(`<!--[0--><a${$.attr_class($.clsx(base()({ home: true, class: clsx(theme()?.base, homeClass) })))}${$.attr('href', href)}>`);

			if (icon) {
				$$renderer.push('<!--[0-->');
				icon($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><svg class="me-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>`);
			}

			$$renderer.push(`<!--]--> `);
			children($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (icon) {
				$$renderer.push('<!--[0-->');
				icon($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(separator()({ class: clsx(theme()?.separator, styling().separator) })))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>`);
			}

			$$renderer.push(`<!--]--> `);

			if (href) {
				$$renderer.push(`<!--[0--><a${$.attr_class($.clsx(base()({
					home: false,
					hasHref: true,
					class: clsx(theme()?.base, linkClass)
				})))}${$.attr('href', href)}>`);

				children($$renderer);
				$$renderer.push(`<!----></a>`);
			} else {
				$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(base()({
					home: false,
					hasHref: false,
					class: clsx(theme()?.base, spanClass)
				})))}>`);

				children($$renderer);
				$$renderer.push(`<!----></span>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></li>`);
	});
}