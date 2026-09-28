import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Stepper_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'stepper-title',
			class: $.clsx(cn('text-lg font-medium', 'group-data-[orientation=vertical]/stepper-nav:text-left', 'group-data-[orientation=horizontal]/stepper-nav:text-center', className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}