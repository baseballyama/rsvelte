import * as $ from 'svelte/internal/server';
import { Toggle as TogglePrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const toggleVariants = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "bg-transparent",
			outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground"
		},
		size: {
			default: "h-9 min-w-9 px-3",
			sm: "h-8 min-w-8 px-2",
			lg: "h-10 min-w-10 px-3"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			pressed = false,
			class: className,
			size = "default",
			variant = "default",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (TogglePrimitive.Root) {
				$$renderer.push('<!--[-->');

				TogglePrimitive.Root($$renderer, $.spread_props([
					{ class: cn(toggleVariants({ variant, size }), className) },
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						get pressed() {
							return pressed;
						},

						set pressed($$value) {
							pressed = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, pressed });
	});
}