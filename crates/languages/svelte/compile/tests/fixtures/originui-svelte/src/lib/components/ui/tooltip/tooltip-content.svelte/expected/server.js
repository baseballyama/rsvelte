import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Tooltip } from 'bits-ui';

export default function Tooltip_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			showArrow = false,
			sideOffset = 4,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (Tooltip.Portal) {
			$$renderer.push('<!--[-->');

			Tooltip.Portal($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Content) {
						$$renderer.push('<!--[-->');

						Tooltip.Content($$renderer, $.spread_props([
							{
								ref,
								sideOffset,
								class: cn('bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-w-70 rounded-md border px-3 py-1.5 text-sm', className)
							},
							restProps,
							{
								children: ($$renderer) => {
									children?.($$renderer);
									$$renderer.push(`<!----> `);

									if (showArrow) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Arrow) {
											$$renderer.push('<!--[-->');

											Tooltip.Arrow($$renderer, {
												class: 'text-popover -my-px drop-shadow-[0_1px_0_hsl(var(--border))]'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref });
	});
}