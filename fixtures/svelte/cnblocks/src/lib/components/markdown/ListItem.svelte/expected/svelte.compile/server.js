import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function ListItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<li${$.attributes({
			...restProps,
			class: $.clsx(cn("leading-relaxed text-foreground/70", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
	});
}