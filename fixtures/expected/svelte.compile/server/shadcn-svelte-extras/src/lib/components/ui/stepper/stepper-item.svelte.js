import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { useStepperItem } from './stepper.svelte.js';

export default function Stepper_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = uid,
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const stepperItemState = useStepperItem({ id });

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'stepper-item',
			class: $.clsx(cn('group/stepper-item relative flex', { 'flex-1': !stepperItemState.isLast }, className)),
			...stepperItemState.props,
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}