import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			href = "#",
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<a${$.attributes({
			href,
			...restProps,
			class: $.clsx(cn("text-foreground underline underline-offset-2 transition-[color] duration-150 ease-out hover:text-foreground/70", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}