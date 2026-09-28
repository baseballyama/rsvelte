import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function P($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<p${$.attributes({
			class: $.clsx(cn("leading-relaxed [&:not(:first-child)]:mt-6", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
	});
}