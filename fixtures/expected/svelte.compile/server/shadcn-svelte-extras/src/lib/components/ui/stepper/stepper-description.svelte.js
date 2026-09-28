import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Stepper_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'stepper-description',
			class: $.clsx(cn('text-muted-foreground text-sm', 'group-data-[orientation=vertical]/stepper-nav:text-left', 'group-data-[orientation=horizontal]/stepper-nav:text-center', className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}