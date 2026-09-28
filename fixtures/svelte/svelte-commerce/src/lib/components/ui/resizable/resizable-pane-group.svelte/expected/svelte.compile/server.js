import * as $ from 'svelte/internal/server';
import * as ResizablePrimitive from 'paneforge';
import { cn } from '$lib/core/utils';

export default function Resizable_pane_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			direction,
			this: paneGroup = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (ResizablePrimitive.PaneGroup) {
			$$renderer.push('<!--[-->');

			ResizablePrimitive.PaneGroup($$renderer, $.spread_props([
				{
					direction,
					class: cn('flex h-full w-full data-[direction=vertical]:flex-col', className)
				},
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { this: paneGroup });
	});
}