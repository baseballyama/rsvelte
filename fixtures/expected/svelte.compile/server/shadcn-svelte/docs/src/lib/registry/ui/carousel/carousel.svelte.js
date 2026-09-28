import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { setEmblaContext } from "./context.js";

export default function Carousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			opts = {},
			plugins = [],
			setApi = () => {},
			orientation = "horizontal",
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// svelte-ignore state_referenced_locally
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

		function onSelect() {
			if (!carouselState.api) return;

			carouselState.selectedIndex = carouselState.api.selectedScrollSnap();
			carouselState.canScrollNext = carouselState.api.canScrollNext();
			carouselState.canScrollPrev = carouselState.api.canScrollPrev();
		}

		function handleKeyDown(e) {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				scrollPrev();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				scrollNext();
			}
		}

		function onInit(event) {
			carouselState.api = event.detail;
			setApi(carouselState.api);
			carouselState.scrollSnaps = carouselState.api.scrollSnapList();
			carouselState.api.on("select", onSelect);
			onSelect();
		}

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'carousel',
			class: $.clsx(cn("relative", className)),
			role: 'region',
			'aria-roledescription': 'carousel',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}