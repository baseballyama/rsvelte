import * as $ from 'svelte/internal/server';
import { timelineContext } from './timeline-context.svelte';
import { cn } from '$lib/utils';

export default function Timeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			defaultValue = 1,
			onValueChange,
			orientation = 'vertical',
			ref = null,
			value,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let activeStep = defaultValue;

		function setActiveStep(step) {
			if (value === undefined) {
				activeStep = step;
			}

			onValueChange?.(step);
		}

		const currentStep = $.derived(() => value ?? activeStep);

		timelineContext.set({ activeStep: currentStep(), setActiveStep });

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'timeline',
			class: $.clsx(cn('group/timeline flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col', className)),
			'data-orientation': orientation,
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}