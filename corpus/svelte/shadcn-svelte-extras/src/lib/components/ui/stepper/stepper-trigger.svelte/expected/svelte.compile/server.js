import * as $ from 'svelte/internal/server';
import { useStepperItemTrigger } from './stepper.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils.js';

export default function Stepper_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			disabled = false,
			onclick,
			onkeydown,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = useStepperItemTrigger({
			ref: box.with(() => ref),
			disabled: box.with(() => disabled ?? false),
			onclick: box.with(() => onclick),
			onkeydown: box.with(() => onkeydown)
		});

		$$renderer.push(`<button${$.attributes({
			'data-slot': 'stepper-trigger',
			class: $.clsx(cn('group/stepper-trigger z-1 flex outline-none', 'group-data-[orientation=horizontal]/stepper-nav:flex-col', 'group-data-[orientation=vertical]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:gap-4', className)),
			...triggerState.props,
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></button>`);
		$.bind_props($$props, { ref });
	});
}