import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Table_caption($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<caption${$.attributes({
			class: $.clsx(cn("text-muted-foreground mt-4 text-sm", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></caption>`);
	});
}