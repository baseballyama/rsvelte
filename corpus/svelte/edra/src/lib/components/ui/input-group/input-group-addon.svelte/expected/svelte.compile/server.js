import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';

export const inputGroupAddonVariants = tv({
	base: "text-muted-foreground h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4 flex cursor-text items-center justify-center select-none",
	variants: {
		align: {
			'inline-start': 'pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] order-first',
			'inline-end': 'pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem] order-last',
			'block-start': 'px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start',
			'block-end': 'px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start'
		}
	},
	defaultVariants: { align: 'inline-start' }
});

export default function Input_group_addon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			align = 'inline-start',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			role: 'group',
			'data-slot': 'input-group-addon',
			'data-align': align,
			class: $.clsx(cn(inputGroupAddonVariants({ align }), className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}