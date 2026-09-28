import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import { getEmblaContext } from "./context.js";

export default function Carousel_previous($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			variant = "outline",
			size = "icon-sm",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const emblaCtx = getEmblaContext("<Carousel.Previous/>");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					'data-slot': 'carousel-previous',
					variant,
					size,
					'aria-disabled': !emblaCtx.canScrollPrev,
					disabled: !emblaCtx.canScrollPrev,
					class: cn(
						"cn-carousel-previous absolute touch-manipulation",
						emblaCtx.orientation === "horizontal"
							? "inset-y-0 -start-12 my-auto"
							: "start-1/2 -top-12 -translate-x-1/2 rotate-90",
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
						IconPlaceholder($$renderer, {
							lucide: 'ChevronLeftIcon',
							tabler: 'IconChevronLeft',
							hugeicons: 'ArrowLeft01Icon',
							phosphor: 'CaretLeftIcon',
							remixicon: 'RiArrowLeftSLine'
						});

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