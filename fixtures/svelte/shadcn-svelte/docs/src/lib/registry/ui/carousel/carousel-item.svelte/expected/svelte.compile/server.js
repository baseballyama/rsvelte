import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { getEmblaContext } from "./context.js";

export default function Carousel_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const emblaCtx = getEmblaContext("<Carousel.Item/>");

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'carousel-item',
			role: 'group',
			'aria-roledescription': 'slide',
			class: $.clsx(cn("min-w-0 shrink-0 grow-0 basis-full", emblaCtx.orientation === "horizontal" ? "ps-4" : "pt-4", className)),
			'data-embla-slide': '',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}