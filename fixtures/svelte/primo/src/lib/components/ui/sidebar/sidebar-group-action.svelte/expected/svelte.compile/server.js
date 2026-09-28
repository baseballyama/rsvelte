import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.ts';

export default function Sidebar_group_action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const propObj = $.derived(() => ({
			class: cn(
				'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
				// Increases the hit area of the button on mobile.
				'after:absolute after:-inset-2 md:after:hidden',
				'group-data-[collapsible=icon]:hidden',
				className
			),
			'data-sidebar': 'group-action',
			...restProps
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: propObj() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...propObj() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}