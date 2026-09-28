import * as $ from 'svelte/internal/server';
import { setEmblaContext } from './context.js';
import { cn } from '$lib/core/utils/index.js';

export default function Carousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			opts = {},
			plugins = [],
			setApi = () => {},
			orientation = 'horizontal',
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let carouselState = {
			api: undefined,
			scrollPrev,
			scrollNext,
			orientation,
			canScrollNext: false,
			canScrollPrev: false,
			handleKeyDown,
			options: opts,
			plugins,
			onInit,
			scrollSnaps: [],
			selectedIndex: 0,
			scrollTo
		};

		setEmblaContext(carouselState);

		function scrollPrev() {
			carouselState.api?.scrollPrev();
		}

		function scrollNext() {
			carouselState.api?.scrollNext();
		}

		function scrollTo(index, jump) {
			carouselState.api?.scrollTo(index, jump);
		}

		function onSelect(api) {
			if (!api) return;

			carouselState.canScrollPrev = api.canScrollPrev();
			carouselState.canScrollNext = api.canScrollNext();
			carouselState.selectedIndex = api.selectedScrollSnap();
		}

		function handleKeyDown(e) {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				scrollPrev();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				scrollNext();
			}
		}

		function onInit(event) {
			carouselState.api = event.detail;
			carouselState.scrollSnaps = carouselState.api.scrollSnapList();
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('relative', className)),
			role: 'region',
			'aria-roledescription': 'carousel',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}