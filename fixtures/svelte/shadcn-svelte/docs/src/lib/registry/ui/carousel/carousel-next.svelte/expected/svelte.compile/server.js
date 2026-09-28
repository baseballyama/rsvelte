import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import { getEmblaContext } from "./context.js";

export default function Carousel_next($$renderer, $$props) {
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

		const emblaCtx = getEmblaContext("<Carousel.Next/>");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					'data-slot': 'carousel-next',
					variant,
					size,
					'aria-disabled': !emblaCtx.canScrollNext,
					disabled: !emblaCtx.canScrollNext,
					class: cn(
						"cn-carousel-next absolute touch-manipulation",
						emblaCtx.orientation === "horizontal"
							? "inset-y-0 -end-12 my-auto"
							: "start-1/2 -bottom-12 -translate-x-1/2 rotate-90",
						className
					),
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
						IconPlaceholder($$renderer, {
							lucide: 'ChevronRightIcon',
							tabler: 'IconChevronRight',
							hugeicons: 'ArrowRight01Icon',
							phosphor: 'CaretRightIcon',
							remixicon: 'RiArrowRightSLine'
						});

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