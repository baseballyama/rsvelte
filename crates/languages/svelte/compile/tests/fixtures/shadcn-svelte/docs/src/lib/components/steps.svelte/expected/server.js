import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Steps($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("steps mb-12 [counter-reset:step] *:[aria-level='3']:first:!mt-0 [&>[aria-level='3']]:step", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}