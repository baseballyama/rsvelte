import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div class="relative mt-2 mb-10 w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm"><table${$.attributes({
			...restProps,
			class: $.clsx(cn("w-full text-base [&_code]:text-sm", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></table></div>`);
	});
}