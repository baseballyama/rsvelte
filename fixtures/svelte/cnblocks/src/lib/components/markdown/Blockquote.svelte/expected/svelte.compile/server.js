import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Blockquote($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<blockquote${$.attributes({
			...restProps,
			class: $.clsx(cn("mt-6 rounded-xl border border-border bg-card px-5 py-3 text-sm text-foreground/70 italic shadow-sm", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></blockquote>`);
	});
}