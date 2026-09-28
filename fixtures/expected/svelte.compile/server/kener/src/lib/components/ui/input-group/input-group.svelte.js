import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Input_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'input-group',
			role: 'group',
			class: $.clsx(cn(
				"group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
				"h-9 has-[>textarea]:h-auto",
				// Variants based on alignment.
				"has-[>[data-align=inline-start]]:[&>input]:ps-2",
				"has-[>[data-align=inline-end]]:[&>input]:pe-2",
				"has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
				"has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
				// Focus state.
				"has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",
				// Error state.
				"has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
				className
			)),
			...props
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}