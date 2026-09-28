import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Sidebar_inset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<main${$.attributes({
			class: $.clsx(cn('relative flex min-h-svh flex-1 flex-col bg-background', 'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
		$.bind_props($$props, { ref });
	});
}