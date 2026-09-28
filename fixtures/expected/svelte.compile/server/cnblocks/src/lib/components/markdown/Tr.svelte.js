import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Tr($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tr${$.attributes({
			...restProps,
			class: $.clsx(cn("hover:bg-card-muted/60 data-[state=selected]:bg-card-muted/60 transition-[background-color] duration-150 ease-out", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tr>`);
	});
}