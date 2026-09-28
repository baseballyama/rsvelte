import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Paragraph($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<p${$.attributes({
			...restProps,
			class: $.clsx(cn("mt-4 text-base leading-normal text-muted-foreground first:mt-0", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
	});
}