import * as $ from 'svelte/internal/server';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { cn } from "$lib/utils.js";

import {
	SIDEBAR_COOKIE_MAX_AGE,
	SIDEBAR_COOKIE_NAME,
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_ICON
} from "./constants.js";

import { setSidebar } from "./context.svelte.js";

export default function Sidebar_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			open = true,
			onOpenChange = () => {},
			class: className,
			style,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const sidebar = setSidebar({
			open: () => open,
			setOpen: (value) => {
				open = value;
				onOpenChange(value);

				// This sets the cookie to keep the sidebar state.
				document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
			}
		});

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				delayDuration: 0,
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attributes({
						'data-slot': 'sidebar-wrapper',
						style: `--sidebar-width: ${$.stringify(SIDEBAR_WIDTH)}; --sidebar-width-icon: ${$.stringify(SIDEBAR_WIDTH_ICON)}; ${$.stringify(style)}`,
						class: $.clsx(cn("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar", className)),
						...restProps
					})}>`);

					children?.($$renderer);
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref, open });
	});
}