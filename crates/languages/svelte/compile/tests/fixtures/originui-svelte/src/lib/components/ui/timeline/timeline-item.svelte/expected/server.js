import * as $ from 'svelte/internal/server';
import { useTimeline } from './timeline-context.svelte';
import { cn } from '$lib/utils';

export default function Timeline_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			step,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const { activeStep } = useTimeline();

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('group/timeline-item relative flex flex-1 flex-col gap-0.5 group-data-[orientation=horizontal]/timeline:mt-8 not-last:group-data-[orientation=horizontal]/timeline:pe-8 group-data-[orientation=vertical]/timeline:ms-8 not-last:group-data-[orientation=vertical]/timeline:pb-12', '[&:has(+[data-completed="true"])_[data-slot=timeline-separator]]:bg-primary', className)),
			'data-slot': 'timeline-item',
			'data-completed': step <= activeStep || undefined,
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}