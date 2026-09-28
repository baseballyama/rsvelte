import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div class="my-6 w-full overflow-y-auto"><table${$.attributes({ class: $.clsx(cn("w-full", className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></table></div>`);
	});
}