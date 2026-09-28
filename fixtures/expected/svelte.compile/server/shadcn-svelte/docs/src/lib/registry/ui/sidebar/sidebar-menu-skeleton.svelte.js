import * as $ from 'svelte/internal/server';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import { cn } from "$lib/utils.js";

export default function Sidebar_menu_skeleton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			showIcon = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Random width between 50% and 90%
		const width = `${Math.floor(Math.random() * 40) + 50}%`;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'sidebar-menu-skeleton',
			'data-sidebar': 'menu-skeleton',
			class: $.clsx(cn("cn-sidebar-menu-skeleton flex items-center", className)),
			...restProps
		})}>`);

		if (showIcon) {
			$$renderer.push('<!--[0-->');

			Skeleton($$renderer, {
				class: 'cn-sidebar-menu-skeleton-icon',
				'data-sidebar': 'menu-skeleton-icon'
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Skeleton($$renderer, {
			class: 'cn-sidebar-menu-skeleton-text max-w-(--skeleton-width) flex-1',
			'data-sidebar': 'menu-skeleton-text',
			style: `--skeleton-width: ${width};`
		});

		$$renderer.push(`<!----> `);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}