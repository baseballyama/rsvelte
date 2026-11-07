import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Stepper_indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'stepper-indicator',
			class: $.clsx(cn('bg-primary text-primary-foreground z-1 flex size-7 shrink-0 items-center justify-center rounded-full ring-3 transition-colors select-none [&_svg]:size-4', 'group-data-[state=inactive]/stepper-trigger:text-muted-foreground group-data-[state=inactive]/stepper-trigger:bg-muted ring-background', 'group-focus-visible/stepper-trigger:ring-ring/50', className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}