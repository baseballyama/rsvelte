import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function H2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<h2${$.attributes({
			...restProps,
			class: $.clsx(cn("mt-4 scroll-m-20 font-sans text-2xl font-medium text-foreground", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h2>`);
	});
}