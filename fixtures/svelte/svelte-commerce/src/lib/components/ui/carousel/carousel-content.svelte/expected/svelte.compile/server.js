import * as $ from 'svelte/internal/server';
import emblaCarouselSvelte from 'embla-carousel-svelte';
import { getEmblaContext } from './context.js';
import { cn } from '$lib/core/utils/index.js';

export default function Carousel_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const emblaCtx = getEmblaContext('<Carousel.Content/>');

		$$renderer.push(`<div class="overflow-hidden"><div${$.attributes({
			class: $.clsx(cn('flex', emblaCtx.orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)),
			'data-embla-container': '',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { ref });
	});
}