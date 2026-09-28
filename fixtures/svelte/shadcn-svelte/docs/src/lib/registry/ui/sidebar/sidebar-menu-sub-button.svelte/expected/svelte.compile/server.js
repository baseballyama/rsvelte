import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Sidebar_menu_sub_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			children,
			child,
			class: className,
			size = "md",
			isActive = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const mergedProps = $.derived(() => ({
			class: cn("cn-sidebar-menu-sub-button flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0", className),
			"data-slot": "sidebar-menu-sub-button",
			"data-sidebar": "menu-sub-button",
			"data-size": size,
			"data-active": isActive,
			...restProps
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}