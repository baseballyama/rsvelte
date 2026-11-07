import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Table_row($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<tr${$.attributes({ class: $.clsx(cn("border-b", className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></tr>`);
	});
}