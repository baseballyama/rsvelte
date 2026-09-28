import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function H1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<h1${$.attributes({
			...restProps,
			class: $.clsx(cn("scroll-m-24 font-sans text-3xl font-medium text-foreground", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h1>`);
	});
}