import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function OrderedList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<ol${$.attributes({
			...restProps,
			class: $.clsx(cn("mt-6 list-decimal space-y-2 pl-6 text-base leading-relaxed text-foreground/70 [&>li]:pl-1", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ol>`);
	});
}