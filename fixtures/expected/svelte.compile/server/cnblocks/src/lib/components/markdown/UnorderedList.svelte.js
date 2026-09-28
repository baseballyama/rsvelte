import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function UnorderedList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<ul${$.attributes({
			...restProps,
			class: $.clsx(cn("mt-6 list-disc space-y-2 pl-6 text-base leading-relaxed text-foreground/70 [&>li]:pl-1", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
	});
}