import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Table_head($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<th${$.attributes({
			class: $.clsx(cn("text-muted-foreground h-10 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></th>`);
	});
}