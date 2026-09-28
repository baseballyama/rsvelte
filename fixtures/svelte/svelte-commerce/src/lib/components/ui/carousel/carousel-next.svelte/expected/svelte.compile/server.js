import * as $ from 'svelte/internal/server';
import { ChevronRight } from '@lucide/svelte';
import { getEmblaContext } from './context.js';
import { cn } from '$lib/core/utils/index.js';
import { Button } from '$lib/components/ui/button/index.js';

export default function Carousel_next($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			variant = 'outline',
			size = 'icon',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const emblaCtx = getEmblaContext('<Carousel.Next/>');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					variant,
					size,
					class: cn(
						'absolute size-8 bg-background border-muted touch-manipulation !rounded-full',
						emblaCtx.orientation === 'horizontal'
							? '-right-12 top-1/2 -translate-y-1/2'
							: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
						className
					),
					disabled: !emblaCtx.canScrollNext,
					onclick: emblaCtx.scrollNext,
					onkeydown: emblaCtx.handleKeyDown
				},
				restProps,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ChevronRight($$renderer, { class: 'size-4' });
						$$renderer.push(`<!----> <span class="sr-only">Next slide</span>`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}