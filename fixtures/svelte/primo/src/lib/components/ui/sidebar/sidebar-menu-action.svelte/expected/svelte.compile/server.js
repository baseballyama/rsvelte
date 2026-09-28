import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.ts';

export default function Sidebar_menu_action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			showOnHover = false,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const mergedProps = $.derived(() => ({
			class: cn(
				'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
				// Increases the hit area of the button on mobile.
				'after:absolute after:-inset-2 md:after:hidden',
				'peer-data-[size=sm]/menu-button:top-1',
				'peer-data-[size=default]/menu-button:top-1.5',
				'peer-data-[size=lg]/menu-button:top-2.5',
				'group-data-[collapsible=icon]:hidden',
				showOnHover && 'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
				className
			),
			'data-sidebar': 'menu-action',
			...restProps
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}