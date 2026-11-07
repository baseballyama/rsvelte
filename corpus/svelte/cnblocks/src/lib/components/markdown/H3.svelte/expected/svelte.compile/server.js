import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function H3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<h3${$.attributes({
			...restProps,
			class: $.clsx(cn("mt-4 scroll-m-24 font-display text-xl font-medium text-foreground", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h3>`);
	});
}