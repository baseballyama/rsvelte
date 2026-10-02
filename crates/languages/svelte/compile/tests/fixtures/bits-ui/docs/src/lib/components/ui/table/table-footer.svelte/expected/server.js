import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Table_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<tfoot${$.attributes({
			class: $.clsx(cn("bg-primary text-primary-foreground font-medium", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tfoot>`);
	});
}