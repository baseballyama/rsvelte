import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
	base: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:brightness-95",
			neutral: "bg-foreground text-background hover:brightness-95",
			destructive: "text-destructive-foreground bg-destructive shadow-md hover:bg-destructive/90",
			outline: "border border-transparent bg-background text-foreground shadow-sm ring-1 shadow-black/15 ring-foreground/10 duration-200 hover:bg-muted/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 rounded-md px-4 py-2",
			sm: "h-8 rounded-full px-3 text-sm",
			lg: "h-11 px-6 text-base font-medium",
			icon: "size-9"
		}
	},
	defaultVariants: { variant: "default", size: "sm" }
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
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({
				class: $.clsx(cn(buttonVariants({ variant, size }), className)),
				href,
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({
				class: $.clsx(cn(buttonVariants({ variant, size }), className)),
				type,
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}