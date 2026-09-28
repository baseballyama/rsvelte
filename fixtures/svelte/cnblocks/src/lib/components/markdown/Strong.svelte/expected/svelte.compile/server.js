import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Strong($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<strong${$.attributes({
			...restProps,
			class: $.clsx(cn("text-base font-medium text-foreground", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></strong>`);
	});
}