import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function H6($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h6${$.attributes({
			class: $.clsx(cn("mt-8 scroll-m-20 text-base font-semibold tracking-tight", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h6>`);
	});
}