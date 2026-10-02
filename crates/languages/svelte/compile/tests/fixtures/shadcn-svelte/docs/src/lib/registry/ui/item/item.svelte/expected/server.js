import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const itemVariants = tv({
	base: "cn-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors",
	variants: {
		variant: {
			default: "cn-item-variant-default",
			outline: "cn-item-variant-outline",
			muted: "cn-item-variant-muted"
		},
		size: {
			default: "cn-item-size-default",
			sm: "cn-item-size-sm",
			xs: "cn-item-size-xs"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			child,
			variant,
			size,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const mergedProps = $.derived(() => ({
			class: cn(itemVariants({ variant, size }), className),
			"data-slot": "item",
			"data-variant": variant,
			"data-size": size,
			...restProps
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			mergedProps().children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}