import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { useStepperNav } from './stepper.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Stepper_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			orientation = 'horizontal',
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const stepperNavState = useStepperNav({ orientation: box.with(() => orientation) });

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'stepper-nav',
			class: $.clsx(cn(
				'group/stepper-nav flex',
				{
					'flex-row justify-between': orientation === 'horizontal',
					'flex-col gap-2': orientation === 'vertical'
				},
				className
			)),
			...stepperNavState.props,
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}