import * as $ from 'svelte/internal/server';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import { getEmblaContext } from './context.js';
import { cn } from '$lib/utils.js';
import { Button } from '$lib/components/ui/button/index.js';

export default function Carousel_previous($$renderer, $$props) {
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

		const emblaCtx = getEmblaContext('<Carousel.Previous/>');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					'data-slot': 'carousel-previous',
					variant,
					size,
					disabled: !emblaCtx.canScrollPrev,
					class: cn(
						'absolute size-8 rounded-full',
						emblaCtx.orientation === 'horizontal'
							? 'top-1/2 -left-12 -translate-y-1/2'
							: '-top-12 left-1/2 -translate-x-1/2 rotate-90',
						className
					),
					onclick: emblaCtx.scrollPrev,
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
						ArrowLeftIcon($$renderer, { class: 'size-4' });
						$$renderer.push(`<!----> <span class="sr-only">Previous slide</span>`);
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