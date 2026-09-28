import * as $ from 'svelte/internal/server';
import { Toggle as TogglePrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const toggleVariants = tv({
	base: "cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "cn-toggle-variant-default",
			outline: "cn-toggle-variant-outline"
		},
		size: {
			default: "cn-toggle-size-default",
			sm: "cn-toggle-size-sm",
			lg: "cn-toggle-size-lg"
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
					{
						'data-slot': 'toggle',
						class: cn(toggleVariants({ variant, size }), className)
					},
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