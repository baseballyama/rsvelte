import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Tbody($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<tbody${$.attributes({
			...restProps,
			class: $.clsx(cn("divide-y divide-border/60", className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tbody>`);
	});
}