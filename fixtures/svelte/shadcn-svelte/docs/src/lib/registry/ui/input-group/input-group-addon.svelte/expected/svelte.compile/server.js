import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const inputGroupAddonVariants = tv({
	base: "cn-input-group-addon flex cursor-text items-center justify-center select-none",
	variants: {
		align: {
			"inline-start": "cn-input-group-addon-align-inline-start order-first",
			"inline-end": "cn-input-group-addon-align-inline-end order-last",
			"block-start": "cn-input-group-addon-align-block-start order-first w-full justify-start",
			"block-end": "cn-input-group-addon-align-block-end order-last w-full justify-start"
		}
	},
	defaultVariants: { align: "inline-start" }
});

export default function Input_group_addon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			align = "inline-start",
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