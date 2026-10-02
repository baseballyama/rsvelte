import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Thead($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<thead${$.attributes({
			...restProps,
			class: $.clsx(cn("bg-card-muted/60 border-b border-border", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></thead>`);
	});
}