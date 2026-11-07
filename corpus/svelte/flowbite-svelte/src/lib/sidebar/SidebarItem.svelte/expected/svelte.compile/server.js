import * as $ from 'svelte/internal/server';
import { getSidebarContext, getActiveUrlContext } from "$lib/context";
import clsx from "clsx";

export default function SidebarItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			icon,
			subtext,
			href,
			label,
			spanClass = "ms-3",
			activeClass,
			nonActiveClass,
			aClass,
			active,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const context = getSidebarContext() ?? {
			closeSidebar: undefined,
			activeClass: undefined,
			nonActiveClass: undefined
		};

		const activeUrl = getActiveUrlContext();

		let activeItem = $.derived(() => active !== undefined
			? active
			: activeUrl?.value ? href === activeUrl.value : false);

		let aCls = $.derived(() => activeItem()
			? activeClass ?? context.activeClass
			: nonActiveClass ?? context.nonActiveClass);

		$$renderer.push(`<li${$.attr_class($.clsx(clsx(className)))}><a${$.attributes({
			...restProps,
			href,
			'aria-current': activeItem() ? "page" : undefined,
			class: $.clsx(clsx(aCls(), aClass))
		})}>`);

		if (icon) {
			$$renderer.push('<!--[0-->');
			icon($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span${$.attr_class($.clsx(clsx(spanClass)))}>${$.escape(label)}</span> `);

		if (subtext) {
			$$renderer.push('<!--[0-->');
			subtext($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></a></li>`);
	});
}