import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Toggle as TogglePrimitive } from 'bits-ui';
import { tv } from 'tailwind-variants';

export const toggleVariants = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,box-shadow] hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	defaultVariants: { size: 'default', variant: 'default' },
	variants: {
		size: { default: 'h-9 px-3', lg: 'h-10 px-3', sm: 'h-8 px-2' },
		variant: {
			default: 'bg-transparent',
			outline: 'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground'
		}
	}
});

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			pressed = false,
			ref = null,
			size = 'default',
			variant = 'default',
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
					{ class: cn(toggleVariants({ className, size, variant })) },
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
		$.bind_props($$props, { pressed, ref });
	});
}