import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Kbd($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<kbd${$.attributes({
			'data-slot': 'kbd',
			class: $.clsx(cn("bg-muted text-muted-foreground in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none [&_svg:not([class*='size-'])]:size-3", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></kbd>`);
		$.bind_props($$props, { ref });
	});
}