import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Td($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<td${$.attributes({
			class: $.clsx(cn("px-4 py-2 text-start whitespace-nowrap [&[align=center]]:text-center [&[align=right]]:text-end", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></td>`);
	});
}