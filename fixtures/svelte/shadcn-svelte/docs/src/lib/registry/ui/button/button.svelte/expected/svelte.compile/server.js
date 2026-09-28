import * as $ from 'svelte/internal/server';
import { tv } from "tailwind-variants";
import { cn } from "$lib/utils.js";

export const buttonVariants = tv({
	base: "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "cn-button-variant-default",
			outline: "cn-button-variant-outline",
			secondary: "cn-button-variant-secondary",
			ghost: "cn-button-variant-ghost",
			destructive: "cn-button-variant-destructive",
			link: "cn-button-variant-link"
		},
		size: {
			default: "cn-button-size-default",
			xs: "cn-button-size-xs",
			sm: "cn-button-size-sm",
			lg: "cn-button-size-lg",
			icon: "cn-button-size-icon",
			"icon-xs": "cn-button-size-icon-xs",
			"icon-sm": "cn-button-size-icon-sm",
			"icon-lg": "cn-button-size-icon-lg"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			variant = "default",
			size = "default",
			ref = null,
			href = undefined,
			type = "button",
			disabled,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({
				'data-slot': 'button',
				class: $.clsx(cn(buttonVariants({ variant, size }), className)),
				href: disabled ? undefined : href,
				'aria-disabled': disabled,
				role: disabled ? "link" : undefined,
				tabindex: disabled ? -1 : undefined,
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({
				'data-slot': 'button',
				class: $.clsx(cn(buttonVariants({ variant, size }), className)),
				type,
				disabled,
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}