import * as $ from 'svelte/internal/server';
import { GripVertical } from '@lucide/svelte';
import * as ResizablePrimitive from 'paneforge';
import { cn } from '$lib/core/utils';

export default function Resizable_handle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			withHandle = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (ResizablePrimitive.PaneResizer) {
			$$renderer.push('<!--[-->');

			ResizablePrimitive.PaneResizer($$renderer, $.spread_props([
				{
					class: cn('relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-direction=vertical]>div]:rotate-90', className)
				},
				restProps,
				{
					children: ($$renderer) => {
						if (withHandle) {
							$$renderer.push(`<!--[0--><div class="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">`);
							GripVertical($$renderer, { class: 'size-2.5' });
							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}