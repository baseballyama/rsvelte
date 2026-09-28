import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function H2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h2${$.attributes({
			class: $.clsx(cn("mt-12 scroll-m-[70px] text-[27px] font-semibold tracking-[-0.01em] first:mt-0", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h2>`);
	});
}