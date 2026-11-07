import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

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
			class: $.clsx(cn('bg-background relative flex h-svh flex-1 flex-col', 'peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
		$.bind_props($$props, { ref });
	});
}