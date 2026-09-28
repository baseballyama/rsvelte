import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Th($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<th${$.attributes({
			...restProps,
			class: $.clsx(cn("h-10 px-4 text-left align-middle font-normal text-foreground", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></th>`);
	});
}