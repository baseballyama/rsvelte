import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "border border-primary bg-radial-[at_52%_-52%] from-primary/70 to-primary/95 text-sm text-primary-foreground shadow-md ring-0 inset-shadow-2xs shadow-zinc-950/30 inset-shadow-white/25 transition-[filter] duration-200 **:[text-shadow:0_1px_0_var(--color-primary)] active:brightness-95 dark:border-0 dark:from-primary dark:to-primary/70 dark:inset-shadow-white dark:hover:to-primary",
			destructive: "text-destructive-foreground bg-destructive shadow-xs hover:bg-destructive/90",
			outline: "border border-zinc-300 bg-linear-to-t from-muted to-background shadow-xs shadow-zinc-950/10 duration-200 hover:to-muted dark:border-border dark:from-muted/50 dark:hover:to-muted/50",
			secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
			neutral: "bg-foreground text-background hover:brightness-95",
			mdefault: "bg-primary text-primary-foreground hover:brightness-95"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			extralg: "h-10 rounded-md px-8 md:h-12",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = "default",
			size = "default",
			href = undefined,
			type = "button",
			loading = false,
			disabled = false,
			tabindex = 0,
			onclick,
			onClickPromise,
			class: className,
			"data-slot": dataSlot = "button",
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$.element(
			$$renderer,
			href ? "a" : "button",
			() => {
				$$renderer.push(`${$.attributes({
					...rest,
					'data-slot': dataSlot,
					type: href ? undefined : type,
					href: href && !disabled ? href : undefined,
					disabled: href ? undefined : disabled || loading,
					'aria-disabled': href ? disabled : undefined,
					role: href && disabled ? "link" : undefined,
					tabindex: href && disabled ? -1 : tabindex,
					class: $.clsx(cn(buttonVariants({ variant, size }), className))
				})}`);
			},
			() => {
				if (type !== undefined && loading) {
					$$renderer.push(`<!--[0--><div class="flex animate-spin place-items-center justify-center">`);
					LoaderCircleIcon($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----></div> <span class="sr-only">Loading</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}
		);

		$.bind_props($$props, { ref });
	});
}