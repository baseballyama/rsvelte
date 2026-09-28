import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { useStepperSeparator } from './stepper.svelte.js';

export default function Stepper_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;
		const separatorState = useStepperSeparator();

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'stepper-separator',
			class: $.clsx(cn('bg-muted data-[state=completed]:bg-primary absolute shrink-0 transition-colors', 'group-data-[orientation=horizontal]/stepper-nav:top-[12px] group-data-[orientation=horizontal]/stepper-nav:h-1 group-data-[orientation=horizontal]/stepper-nav:w-full', 'group-data-[orientation=vertical]/stepper-nav:top-[28px] group-data-[orientation=vertical]/stepper-nav:left-[12px] group-data-[orientation=vertical]/stepper-nav:h-full group-data-[orientation=vertical]/stepper-nav:w-1', { hidden: separatorState.itemState.isLast }, className)),
			...separatorState.props,
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}