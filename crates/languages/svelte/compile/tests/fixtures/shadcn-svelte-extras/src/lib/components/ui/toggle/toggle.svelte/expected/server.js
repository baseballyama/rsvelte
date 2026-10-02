import * as $ from 'svelte/internal/server';
import { Toggle as TogglePrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';

export const toggleVariants = tv({
	base: "hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive group/toggle hover:bg-muted inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	variants: {
		variant: {
			default: 'bg-transparent',
			outline: 'border-input hover:bg-muted border bg-transparent shadow-xs'
		},
		size: {
			default: 'h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
			sm: 'h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
			lg: 'h-10 min-w-10 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2'
		}
	},
	defaultVariants: { variant: 'default', size: 'default' }
});

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			pressed = false,
			class: className,
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