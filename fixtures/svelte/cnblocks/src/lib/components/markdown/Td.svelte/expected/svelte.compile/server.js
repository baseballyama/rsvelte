import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Td($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<td${$.attributes({
			...restProps,
			class: $.clsx(cn("px-4 py-2 align-middle text-foreground/70", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></td>`);
	});
}