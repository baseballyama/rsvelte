import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function H3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h3${$.attributes({
			class: $.clsx(cn("mt-12 scroll-m-[70px] text-xl font-semibold tracking-tight", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h3>`);
	});
}