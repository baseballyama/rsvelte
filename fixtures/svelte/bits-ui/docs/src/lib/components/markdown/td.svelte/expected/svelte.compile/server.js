import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Td($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<td${$.attributes({
			class: $.clsx(cn("border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></td>`);
	});
}